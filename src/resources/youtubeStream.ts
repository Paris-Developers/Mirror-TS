//how Mirror gets audio for a YouTube track. YouTube sometimes refuses to send a video's audio for a
//minute or two ("Requested format is not available"). The YouTube extractor's own yt-dlp method hands
//yt-dlp's output to the player as soon as yt-dlp starts, so when yt-dlp then fails, the song plays as
//silence and nothing else is tried. This waits for audio to actually arrive, tries yt-dlp a second
//time, then falls back to one of the extractor's own download methods, and throws only if that fails too
import { Readable } from 'stream';
import { Track } from 'discord-player';
import { YoutubeExtractor, getVideoId } from 'discord-player-youtubei';
import { createAdaptiveStream } from 'simple-ytdl-core';
import { Bot } from '../Bot';
import { playerErrors } from './metrics';
import { jsRuntimeArgs, startYtdlp, ytdlpPath } from './ytdlp';

//the fallback makes several requests to YouTube, and any of them can sit for minutes without an
//answer. past this, giving up is the better bet
const fallbackTimeout = 20 * 1000;

//answers that come back the same however often, and however, the song is asked for, so the song
//fails right there: a second try or the fallback would only add a wait. it also means nobody can
//push a song into the fallback on purpose by picking one YouTube won't play.
//"Video unavailable", "not a bot" and "Requested format is not available" are left out on purpose:
//YouTube also says those while it's briefly refusing, which is what the second try is for.
//each comes with the reason the "couldn't play" card and /intro give people, instead of telling
//them to try again
const permanentErrors: [RegExp, string][] = [
	[/confirm your age/i, "It's age-restricted on YouTube"],
	[/members-only/i, "It's only for the channel's members"],
	[/private video/i, "It's a private video"],
	[/removed by the uploader/i, 'Its uploader removed it'],
	[/copyright/i, 'YouTube took it down over a copyright claim'],
	[/has been terminated/i, 'Its YouTube channel has been closed'],
];

//songs YouTube turned down for good, with the reason from the list above
const unavailable = new WeakMap<Track, string>();

//why YouTube won't play this song at all, when that's what stopped it
export function whyUnavailable(track: Track): string | undefined {
	return unavailable.get(track);
}

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
				...jsRuntimeArgs(),
				//the audio on its own when YouTube offers it, otherwise a video with sound, as close to
				//480p as there is (the player keeps only the sound). a video with no sound is never
				//taken, so the fallback below gets its turn. livestreams never offer the audio on its
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
					const permanent = permanentErrors.find(([pattern]) => pattern.test(describe(error)));
					if (permanent) {
						unavailable.set(track, permanent[1]);
						throw new Error(`"${track.title}" is not available on YouTube: ${describe(error)}`);
					}
					if (attempt === 1) await wait(2000);
				}
			}
		}

		//the fallback, for when yt-dlp is missing or failed twice: the extractor's "adaptive" download,
		//asking as YouTube's visionOS app, which is sent links that work as they are and needs no
		//proof-of-origin token. called like this, simple-ytdl-core's createAdaptiveStream uses the link
		//just as YouTube sent it, so youtubei.js's Player.decipher (which runs code from YouTube's
		//player) is never reached, and no token is made (which means running Google's BotGuard script).
		//the extractor's other apps need both, and its "sabr" method does both, all inside Mirror's own
		//process, so none of them are used. extractors.ts also stops YouTube's code running if anything
		//ever does reach Player.decipher
		if (!extractor.innertube) {
			failures.push('the extractor has not connected to YouTube');
		} else {
			try {
				const stream = await inTime(
					createAdaptiveStream(extractor.innertube, id, 'VISIONOS', undefined, false),
					fallbackTimeout
				);
				stream.on('error', (error) => brokeOff('adaptive')(error.message));
				return closeWhenDropped(stream);
			} catch (error) {
				failed('adaptive', error);
			}
		}

		throw new Error(`YouTube didn't send any audio for "${track.title}" (${failures.join('; ')})`);
	};
}

//a fallback that takes too long is given up on. its requests can't be called off, so a stream
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
