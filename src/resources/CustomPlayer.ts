import { Bot } from '../Bot';
import { GuildNodeCreateOptions, GuildQueue, Player, QueryType, Track } from 'discord-player';
import { User, VoiceBasedChannel } from 'discord.js';
import config from '../../config.json';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { AttachmentExtractor, DefaultExtractors } from '@discord-player/extractor';
import { YoutubeExtractor } from 'discord-player-youtubei';

//these settings are optional and absent from most config.json files, so they are read defensively
function configValue(key: string): string | undefined {
	const value = (config as Record<string, unknown>)[key];
	return typeof value === 'string' && value.length ? value : undefined;
}

export class CustomPlayer extends Player {
	constructor(private bot: Bot) {
		super(bot.client);
	}

	//applied whenever a queue is created; Mirror stays in the channel when the queue ends
	public playOptions: GuildNodeCreateOptions = {
		leaveOnEnd: false,
		leaveOnEmpty: false,
		leaveOnStop: false,
	};

	//discord-player 7 ships without YouTube support, so the youtubei extractor provides it
	async loadExtractors(): Promise<void> {
		//the extractor reports why a download attempt failed only through debug messages, so
		//listen before it starts up; without this a failure is just "could not extract stream"
		this.on('debug', (message) => {
			//errors come through this event too, despite the string signature
			const text =
				typeof message === 'string'
					? message
					: String((message as unknown as Error)?.message ?? message);
			if (text.includes('failed with the method')) {
				this.bot.logger.warn(text);
			} else {
				this.bot.logger.debug(text);
			}
		});
		this.on('error', (error) => this.bot.logger.error(error));

		//the extractor has several ways to fetch audio. yt-dlp goes first because it is the most
		//reliable from a server, where YouTube treats requests with more suspicion than it does a
		//home connection. the optional cookie in config.json helps when it asks for a sign in
		await this.extractors.register(YoutubeExtractor, {
			downloads: {
				trialOrder: ['yt-dlp', 'peer', 'adaptive', 'sabr'],
				ytdlp: { cookiePath: configValue('youtube_cookie_file') },
			},
			cookie: configValue('youtube_cookie'),
		});
		await this.extractors.loadMulti(DefaultExtractors);
		this.bot.logger.info('Loaded music extractors');
	}

	//looks up a song name or link typed by a user (/play, /playnext, /intro).
	//links from YouTube, Spotify, SoundCloud and the like go through their own extractors, but any
	//other link would be downloaded by the attachment extractor straight from wherever it points.
	//that would let anyone who can use the bot see the host's IP address, or make it send requests to
	//devices on the host's own network, so that extractor is left out of anything a user types
	async searchFromUser(query: string, requestedBy: User) {
		return this.search(query, {
			requestedBy,
			searchEngine: QueryType.AUTO,
			blockExtractors: [AttachmentExtractor.identifier],
		});
	}

	//plays a sound file from disk (intro themes, the sound effect commands).
	//the youtube extractor answers file queries too and wins on priority, so it sits this one out
	async playFile(channel: VoiceBasedChannel, file: string) {
		const result = await this.play(channel, file, {
			searchEngine: QueryType.FILE,
			blockExtractors: [YoutubeExtractor.identifier],
			nodeOptions: this.playOptions,
		});
		this.bot.logger.debug(
			`Playing ${file} in ${channel.name}: resolved as ${result.track.title}`
		);
		return result;
	}

	//downloads a resolved track to disk. /intro uses this so the sound is on hand and plays
	//the moment someone joins, rather than being fetched from YouTube at that point.
	//pass seconds to keep only the beginning of the track
	async downloadTrack(
		track: Track,
		destination: string,
		seconds?: number
	): Promise<void> {
		const source = await this.trackStream(track);
		if (!seconds) {
			await pipeline(source, createWriteStream(destination));
			return;
		}

		//ffmpeg reads the download on stdin and stops once it has the seconds we asked for.
		//faststart puts the mp4 index at the front of the file: playback streams the file through
		//a pipe, which cannot seek to the end for an index, and such a file plays as silence
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
				destination,
			],
			{ stdio: ['pipe', 'ignore', 'pipe'] }
		);
		let details = '';
		ffmpeg.stderr.on('data', (chunk) => (details += chunk.toString()));
		//ffmpeg closing its input first is expected, so neither side should throw
		source.on('error', () => ffmpeg.stdin.destroy());
		ffmpeg.stdin.on('error', () => source.destroy());
		source.pipe(ffmpeg.stdin);

		await new Promise<void>((resolve, reject) => {
			ffmpeg.on('error', reject);
			ffmpeg.on('close', (code) => {
				source.destroy();
				if (code === 0) return resolve();
				reject(new Error(`ffmpeg exited with ${code}: ${details.slice(-400)}`));
			});
		});
	}

	//the extractor hands back a stream, or a url to fetch one from
	private async trackStream(track: Track): Promise<Readable> {
		const extractor = this.extractors.get(YoutubeExtractor.identifier);
		if (!extractor) throw new Error('the youtube extractor is not loaded');

		const streamable = await extractor.stream(track);
		if (typeof streamable === 'string') {
			const response = await fetch(streamable);
			return Readable.fromWeb(response.body as any);
		}
		if (streamable instanceof Readable) return streamable;
		return (streamable as any).stream;
	}

	registerPlayerEvents() {
		//throw the queue away once Mirror is disconnected or left alone in the channel.
		//an empty queue is not a reason to leave: playOptions keeps Mirror sitting in the
		//channel after a song or sound effect finishes
		this.events.on('disconnect', (queue) => this.discardQueue(queue));
		this.events.on('emptyChannel', (queue) => this.discardQueue(queue));

		this.events.on('error', (queue, error) => {
			this.discardQueue(queue);
			this.bot.logger.error(
				`[${queue.guild.name}] Error emitted from the queue: ${error.message}`
			);
		});

		//one failing track should not kill the queue, so move on to the next one
		this.events.on('playerError', (queue, error) => {
			queue.node.skip();
			this.bot.logger.error(
				`[${queue.guild.name}] Error emitted from the player: ${error.message}`
			);
		});
	}

	private discardQueue(queue: GuildQueue) {
		if (!queue.deleted) queue.delete();
	}
}
