//how Mirror gets audio for a YouTube track. YouTube sometimes refuses to send a video's audio for a
//minute or two ("Requested format is not available"). The YouTube extractor's own yt-dlp method hands
//yt-dlp's output to the player as soon as yt-dlp starts, so when yt-dlp then fails, the song plays as
//silence and nothing else is tried. This waits for audio to actually arrive, tries yt-dlp a second
//time, then falls back to the extractor's other download methods, and throws only if all of them fail
import { Readable } from 'stream';
import { Track } from 'discord-player';
import { YoutubeExtractor, getVideoId } from 'discord-player-youtubei';
import { createAdaptiveStreamMultiStep, createSabrStream } from 'simple-ytdl-core';
import { Bot } from '../Bot';
import { playerErrors } from './metrics';
import { startYtdlp, ytdlpPath } from './ytdlp';

//the fallback methods each make several requests to YouTube, and any of them can sit for minutes
//without an answer. past this, moving on (or giving up) is the better bet
const fallbackTimeout = 20 * 1000;

//answers that come back the same however often yt-dlp asks, so a second try only adds a wait.
//"Video unavailable", "not a bot" and "Requested format is not available" are left out on purpose:
//YouTube also says those while it's briefly refusing, which is what the second try is for
const permanentError =
	/private video|members-only|removed by the uploader|copyright|confirm your age|has been terminated/i;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

export function youtubeStream(bot: Bot, cookiePath?: string) {
	return async (track: Track, extractor: YoutubeExtractor): Promise<Readable> => {
		const id = getVideoId(track.url);
		const failures: string[] = [];
		const failed = (method: string, error: unknown) => {
			const reason = describe(error);
			failures.push(`${method}: ${reason}`);
			bot.logger.warn(`[YouTube] ${method} could not get audio for "${track.title}": ${reason}`);
		};
		//once audio is flowing, a download that breaks just ends the song early, and the player takes
		//that as the song finishing. this is the only record of it
		const brokeOff = (method: string) => (reason: string) => {
			playerErrors.inc({ kind: 'midsong' });
			bot.logger.warn(`[YouTube] ${method} stopped partway through "${track.title}": ${reason}`);
		};

		const ytdlp = ytdlpPath();
		if (!ytdlp) {
			failures.push('yt-dlp: not installed');
		} else {
			const live = (track as Track & { live?: boolean }).live;
			const args = [
				'--js-runtimes', `node:${process.execPath}`,
				//the audio on its own when YouTube offers it, otherwise a video with sound, as close to
				//480p as there is (the player keeps only the sound). a video with no sound is never
				//taken, so the fallbacks below get their turn. livestreams never offer the audio on its
				//own, so theirs is picked near 360p
				'--format', live ? 'b[acodec!=none]' : 'ba/b[acodec!=none]',
				'--format-sort', live ? 'res:360' : 'res:480',
				'--no-playlist',
				'--output', '-',
				'--no-progress',
				...(cookiePath ? ['--cookies', cookiePath] : []),
				'--', `https://www.youtube.com/watch?v=${id}`,
			];
			for (const attempt of [1, 2]) {
				try {
					return closeWhenDropped(await startYtdlp(ytdlp, args, brokeOff('yt-dlp')));
				} catch (error) {
					failed(`yt-dlp (attempt ${attempt})`, error);
					if (permanentError.test(describe(error))) break;
					if (attempt === 1) await wait(2000);
				}
			}
		}

		if (!extractor.innertube) {
			failures.push('the extractor has not connected to YouTube');
		} else {
			const innertube = extractor.innertube;
			const methods: [string, () => Promise<Readable>][] = [
				[
					'adaptive',
					() =>
						createAdaptiveStreamMultiStep(
							innertube,
							id,
							extractor.options.downloads?.adaptiveStream?.customClientOrder
						),
				],
				['sabr', () => createSabrStream(innertube, id)],
			];
			for (const [method, start] of methods) {
				try {
					const stream = await inTime(start(), fallbackTimeout);
					stream.on('error', (error) => brokeOff(method)(error.message));
					return closeWhenDropped(stream);
				} catch (error) {
					failed(method, error);
				}
			}
		}

		throw new Error(`YouTube didn't send any audio for "${track.title}" (${failures.join('; ')})`);
	};
}

//a fallback method that takes too long is given up on. its requests can't be called off, so a stream
//that turns up after that is closed straight away rather than left downloading
function inTime(start: Promise<Readable>, ms: number): Promise<Readable> {
	return new Promise((resolve, reject) => {
		let late = false;
		const timer = setTimeout(() => {
			late = true;
			reject(new Error(`no answer after ${ms / 1000} seconds`));
		}, ms);
		start.then(
			(stream) => {
				clearTimeout(timer);
				if (late) stream.destroy();
				else resolve(stream);
			},
			(error) => {
				clearTimeout(timer);
				reject(error);
			}
		);
	});
}

//the player pipes a song's stream into ffmpeg and then forgets about it. a skip, a stop or Mirror
//leaving kills that ffmpeg, but nothing closes the stream feeding it, which leaves yt-dlp (or a
//download) paused forever, waiting to be read. so whatever the stream is piped into is checked every
//couple of seconds, and once that's gone the stream is closed too. the player's ffmpeg never says
//when it's gone, so checking is the only way to find out
function closeWhenDropped(stream: Readable): Readable {
	const pipe = stream.pipe.bind(stream);
	stream.pipe = <T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T => {
		const check = setInterval(() => {
			if (!(destination as unknown as { destroyed?: boolean }).destroyed) return;
			clearInterval(check);
			stream.destroy();
		}, 2000);
		check.unref();
		stream.once('close', () => clearInterval(check));
		return pipe(destination, options);
	};
	return stream;
}
