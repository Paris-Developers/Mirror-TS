//how Mirror gets audio for a YouTube track. YouTube sometimes refuses to send a video's audio for a
//minute or two ("Requested format is not available"). The YouTube extractor's own yt-dlp method hands
//yt-dlp's output to the player as soon as yt-dlp starts, so when yt-dlp then fails, the song plays as
//silence and nothing else is tried. This waits for audio to actually arrive, tries yt-dlp a second
//time, then falls back to the extractor's other download methods, and throws only if all of them fail
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { PassThrough, Readable } from 'stream';
import { Track } from 'discord-player';
import { YoutubeExtractor, getVideoId } from 'discord-player-youtubei';
import { createAdaptiveStreamMultiStep, createSabrStream } from 'simple-ytdl-core';
import { Bot } from '../Bot';

//yt-dlp usually starts sending audio within a few seconds; waiting longer than this means it's stuck
const firstAudioTimeout = 30 * 1000;

//youtube-dl-exec is optional (it needs Python to install), so yt-dlp may not be there
function ytdlpPath(): string | undefined {
	try {
		const path: string = require('youtube-dl-exec').constants.YOUTUBE_DL_PATH;
		return existsSync(path) ? path : undefined;
	} catch {
		return undefined;
	}
}

export function youtubeStream(bot: Bot, cookiePath?: string) {
	return async (track: Track, extractor: YoutubeExtractor): Promise<Readable> => {
		const id = getVideoId(track.url);
		const failures: string[] = [];
		const failed = (method: string, error: unknown) => {
			const reason = error instanceof Error ? error.message : String(error);
			failures.push(`${method}: ${reason}`);
			bot.logger.warn(`[YouTube] ${method} could not get audio for "${track.title}": ${reason}`);
		};

		const ytdlp = ytdlpPath();
		if (ytdlp) {
			//livestreams have no audio-only format, so a low resolution video stream is used instead
			const args = [
				'--js-runtimes', `node:${process.execPath}`,
				'--format', (track as Track & { live?: boolean }).live ? 'best[height<=360]' : 'bestaudio',
				'--output', '-',
				'--no-warnings',
				'--no-progress',
				...(cookiePath ? ['--cookies', cookiePath] : []),
				'--', `https://www.youtube.com/watch?v=${id}`,
			];
			for (const attempt of [1, 2]) {
				try {
					return await startYtdlp(ytdlp, args);
				} catch (error) {
					failed(`yt-dlp (attempt ${attempt})`, error);
					if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, 2000));
				}
			}
		}

		if (!extractor.innertube) {
			failures.push('the extractor has not connected to YouTube');
		} else {
			try {
				return await createAdaptiveStreamMultiStep(
					extractor.innertube,
					id,
					extractor.options.downloads?.adaptiveStream?.customClientOrder
				);
			} catch (error) {
				failed('adaptive', error);
			}
			try {
				return await createSabrStream(extractor.innertube, id);
			} catch (error) {
				failed('sabr', error);
			}
		}

		throw new Error(`YouTube didn't send any audio for "${track.title}" (${failures.join('; ')})`);
	};
}

//starts yt-dlp and resolves once audio arrives, or rejects with yt-dlp's own error if it exits first
function startYtdlp(path: string, args: string[]): Promise<Readable> {
	return new Promise((resolve, reject) => {
		const child = spawn(path, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
		const audio = new PassThrough({ highWaterMark: 1024 * 1024 });
		let errors = '';
		let started = false;

		const giveUp = (error: Error) => {
			if (started) return;
			clearTimeout(timer);
			child.kill();
			reject(error);
		};
		const timer = setTimeout(
			() => giveUp(new Error(`no audio after ${firstAudioTimeout / 1000} seconds`)),
			firstAudioTimeout
		);

		child.stderr.on('data', (chunk) => (errors = (errors + chunk).slice(-4000)));
		child.stdout.once('data', () => {
			started = true;
			clearTimeout(timer);
			resolve(audio);
		});
		child.stdout.pipe(audio);
		child.on('error', (error) => (started ? audio.destroy(error) : giveUp(error)));
		child.on('close', (code) => giveUp(new Error(errorLine(errors) ?? `yt-dlp exited with code ${code} before sending audio`)));
		//when the player is done with the song (it ended, was skipped or stopped), stop yt-dlp too
		audio.on('close', () => {
			if (child.exitCode === null) child.kill();
		});
	});
}

//yt-dlp's last "ERROR: [youtube] id: reason" line, as just the reason
function errorLine(output: string): string | undefined {
	const line = output
		.split(/\r?\n/)
		.reverse()
		.find((text) => text.startsWith('ERROR:'));
	return line?.replace(/^ERROR:\s*(\[[^\]]+\]\s*[\w-]+:\s*)?/, '').trim();
}
