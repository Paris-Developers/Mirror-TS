import { Player, Track } from 'discord-player';
import { YoutubeExtractor } from 'discord-player-youtubei';
import { spawn } from 'child_process';
import { createWriteStream } from 'fs';
import { rename, rm } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import ffmpegPath from 'ffmpeg-static';

//a few seconds of audio arrive well within this once the download is going. past it, the download
//has stalled, and waiting on it would leave /intro saying "thinking" for minutes
const cutTimeout = 60 * 1000;

//downloads a resolved track to disk. /intro uses this so the sound is on hand and plays
//the moment someone joins, rather than being fetched from YouTube at that point.
//pass seconds to keep only the beginning of the track.
//the file is written under a temporary name and only takes the real one once it's complete, so a
//download that fails leaves the previous file (someone's current intro) as it was
export async function downloadTrack(
	player: Player,
	track: Track,
	destination: string,
	seconds?: number
): Promise<void> {
	const partial = `${destination}.part`;
	try {
		const source = await trackStream(player, track);
		if (seconds) await cut(source, partial, seconds);
		else await pipeline(source, createWriteStream(partial));
		await replace(partial, destination);
	} catch (error) {
		await rm(partial, { force: true }).catch(() => {});
		throw error;
	}
}

//Windows won't replace a file something has open, such as the old intro playing right now, so the
//rename is tried a few more times before giving up
async function replace(from: string, to: string) {
	for (let attempt = 1; ; attempt++) {
		try {
			return await rename(from, to);
		} catch (error) {
			const code = (error as NodeJS.ErrnoException).code ?? '';
			if (attempt >= 10 || !['EPERM', 'EACCES', 'EBUSY'].includes(code)) throw error;
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}
}

//ffmpeg reads the download on stdin and stops once it has the seconds we asked for.
//faststart puts the mp4 index at the front of the file: playback streams the file through
//a pipe, which cannot seek to the end for an index, and such a file plays as silence
function cut(source: Readable, destination: string, seconds: number): Promise<void> {
	const ffmpeg = spawn(
		ffmpegPath as unknown as string,
		[
			'-y',
			'-i',
			'pipe:0',
			'-t',
			String(seconds),
			'-vn',
			'-c:a',
			'aac',
			'-b:a',
			'128k',
			'-movflags',
			'+faststart',
			//the temporary name doesn't end in .mp4, so the format is given outright
			'-f',
			'mp4',
			destination,
		],
		{ stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true }
	);
	let details = '';
	ffmpeg.stderr.on('data', (chunk) => (details = (details + chunk.toString()).slice(-4000)));
	//ffmpeg closing its input first is expected, so neither side should throw
	source.on('error', () => ffmpeg.stdin.destroy());
	ffmpeg.stdin.on('error', () => source.destroy());
	source.pipe(ffmpeg.stdin);

	return new Promise<void>((resolve, reject) => {
		let stalled = false;
		const timer = setTimeout(() => {
			stalled = true;
			ffmpeg.kill();
		}, cutTimeout);
		ffmpeg.on('error', (error) => {
			clearTimeout(timer);
			source.destroy();
			reject(error);
		});
		ffmpeg.on('close', (code) => {
			clearTimeout(timer);
			//closing the download also stops yt-dlp behind it
			source.destroy();
			if (stalled) return reject(new Error(`the download stalled: no finished clip after ${cutTimeout / 1000} seconds`));
			if (code === 0) return resolve();
			reject(new Error(`ffmpeg exited with ${code}: ${details.slice(-400)}`));
		});
	});
}

//the extractor hands back a stream, or a url to fetch one from
async function trackStream(player: Player, track: Track): Promise<Readable> {
	const extractor = player.extractors.get(YoutubeExtractor.identifier);
	if (!extractor) throw new Error('the youtube extractor is not loaded');

	const streamable = await extractor.stream(track);
	if (typeof streamable === 'string') {
		const response = await fetch(streamable);
		if (!response.ok || !response.body) throw new Error(`the download failed with status ${response.status}`);
		return Readable.fromWeb(response.body as any);
	}
	if (streamable instanceof Readable) return streamable;
	return (streamable as any).stream;
}
