import {
	ExtractorExecutionContext,
	ExtractorInfo,
	ExtractorSearchContext,
	Player,
	QueryResolver,
	QueryType,
	SearchOptions,
	SearchQueryType,
} from 'discord-player';
import { User } from 'discord.js';
import { AttachmentExtractor, DefaultExtractors } from '@discord-player/extractor';
import { YoutubeExtractor, YoutubeOptions } from 'discord-player-youtubei';
import { configText } from './config';
import { Bot } from '../Bot';
import { youtubeStream } from './youtubeStream';
import { keepYtdlpUpdated } from './ytdlp';


const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

//the kinds of query that are YouTube's to answer: YouTube links, and plain words to search for
const youtubeQueries = new Set<string>([
	QueryType.YOUTUBE,
	QueryType.YOUTUBE_VIDEO,
	QueryType.YOUTUBE_PLAYLIST,
	QueryType.YOUTUBE_SEARCH,
	QueryType.AUTO,
	QueryType.AUTO_SEARCH,
]);

//the video id in any form of YouTube video link: watch?v= wherever v sits, youtu.be, shorts, live,
//embed, http or no scheme at all. links to a playlist are left alone
function youtubeVideoId(query: string): string | undefined {
	let url: URL;
	try {
		url = new URL(/^[a-z]+:\/\//i.test(query) ? query : `https://${query}`);
	} catch {
		return undefined;
	}
	if (!['http:', 'https:'].includes(url.protocol) || url.searchParams.has('list')) return undefined;
	const host = url.hostname.replace(/^(www|m|music|gaming)\./, '');
	let id: string | null | undefined;
	if (host === 'youtu.be') id = url.pathname.split('/')[1];
	else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
		id = url.searchParams.get('v') ?? /^\/(?:shorts|live|embed|v)\/([^/]+)/.exec(url.pathname)?.[1];
	}
	return id && /^[\w-]{11}$/.test(id) ? id : undefined;
}

type MirrorYoutubeOptions = YoutubeOptions & { bot: Bot };

//the youtube extractor as it comes says yes to every query, and it is asked first, so Spotify,
//SoundCloud and Apple Music links never reached their own extractors, and it then failed on them
//(and on shorts, live and http YouTube links) and the search came back empty. this one only takes
//YouTube links and plain searches, and rewrites the YouTube link forms it can't read. it keeps the
//same identifier, so everything that looks the extractor up still finds it
class MirrorYoutubeExtractor extends YoutubeExtractor {
	declare options: MirrorYoutubeOptions;
	//ahead of the extractors discord-player ships with, some of which also answer plain searches,
	//even when YouTube only comes up after them (a retry after it failed to start)
	priority = 2;

	constructor(context: ExtractorExecutionContext, options: MirrorYoutubeOptions) {
		super(context, options);
	}

	//the player's second pass over the extractors leaves the query type out, so it's worked out here
	async validate(query: string, type?: SearchQueryType | null): Promise<boolean> {
		if (typeof query !== 'string') return false;
		try {
			const resolved = type ?? QueryResolver.resolve(query).type;
			//words with a colon in them ("Zelda: Song of Storms") look like a link of some unknown kind
			//to the player; anything that isn't really a web link is still a search
			if (resolved === QueryType.ARBITRARY) return !/^https?:\/\//i.test(query.trim());
			return youtubeQueries.has(resolved);
		} catch {
			return false;
		}
	}

	async handle(query: string, context: ExtractorSearchContext): Promise<ExtractorInfo> {
		//the extractor only reads https://www.youtube.com/watch?v= and youtu.be links
		const id = context.type === QueryType.YOUTUBE_PLAYLIST ? undefined : youtubeVideoId(query);
		if (id) {
			query = `https://www.youtube.com/watch?v=${id}`;
			context.type = QueryType.YOUTUBE_VIDEO;
		}
		try {
			return await super.handle(query, context);
		} catch (error) {
			//the player drops this error without a word and just finds nothing
			this.options.bot.logger.warn(`[YouTube] Could not look up "${query}": ${describe(error)}`);
			throw error;
		}
	}
}

//discord-player 7 ships without YouTube support, so the youtubei extractor provides it.
//audio comes from youtubeStream: yt-dlp first, since YouTube serves it most reliably, then the
//extractor's other methods, falling back only when one really fails. the optional cookies in
//config.json help when YouTube asks for a sign in
export async function registerExtractors(player: Player, bot: Bot): Promise<void> {
	//an extractor that fails to start is dropped from the player, and the only word of it is this
	//event, which the player's own error listener never hears
	player.extractors.on('error', (_context, extractor, error) =>
		bot.logger.error(`The ${extractor.identifier} extractor failed to start or stop:`, error)
	);

	//starting the YouTube extractor means fetching from YouTube. startup waits a little for it, but
	//a request that hangs shouldn't keep Mirror from logging in, so the rest carries on in the background
	const started = startYoutube(player, bot);
	const youtube = await Promise.race([
		started.then((ready) => (ready ? 'ready' : 'failed')),
		new Promise<'starting'>((resolve) => setTimeout(() => resolve('starting'), 20 * 1000).unref()),
	]);
	await player.extractors.loadMulti(DefaultExtractors);

	if (youtube === 'ready') bot.logger.info('Loaded music extractors');
	else if (youtube === 'failed') {
		bot.logger.error('Loaded music extractors without YouTube, so YouTube songs will not play until it connects');
	} else {
		bot.logger.warn('Loaded music extractors; YouTube is slow to connect and will finish in the background');
		started.then((ready) => ready && bot.logger.info('YouTube connected'));
	}

	//runs in the background: reports a missing yt-dlp now, and keeps it up to date
	keepYtdlpUpdated(bot);
}

//when YouTube can't be reached at startup (an outage, a refusal, the network not up yet), the extractor
//fails to start and would stay missing until Mirror restarts, so it's tried again, less often each time.
//resolves with whether this try connected
async function startYoutube(player: Player, bot: Bot, attempt = 1): Promise<boolean> {
	try {
		await player.extractors.register(MirrorYoutubeExtractor, {
			createStream: youtubeStream(bot, configText('youtube_cookie_file')),
			cookie: configText('youtube_cookie'),
			bot,
		});
	} catch (error) {
		bot.logger.error('The YouTube extractor could not be set up:', error);
	}
	if (player.extractors.isRegistered(MirrorYoutubeExtractor.identifier)) {
		if (attempt > 1) bot.logger.info(`YouTube connected on try ${attempt}`);
		return true;
	}
	const minutes = Math.min(2 ** (attempt - 1), 30);
	bot.logger.error(`YouTube could not connect, so YouTube songs won't play. Trying again in ${minutes} min`);
	setTimeout(() => startYoutube(player, bot, attempt + 1), minutes * 60 * 1000).unref();
	return false;
}

//looks up a song name or link typed by a user (/play, /playnext, /intro).
//links from YouTube, Spotify, SoundCloud and the like go through their own extractors, but any
//other link would be downloaded by the attachment extractor straight from wherever it points.
//that would let anyone who can use the bot see the host's IP address, or make it send requests to
//devices on the host's own network, so that extractor is left out of anything a user types
export function userSearchOptions(requestedBy: User): SearchOptions {
	return {
		requestedBy,
		searchEngine: QueryType.AUTO,
		blockExtractors: [AttachmentExtractor.identifier],
	};
}

//plays a sound file from disk (intro themes, the sound effect commands).
//the youtube extractor no longer answers file queries, but it's kept out anyway so a file can never
//end up searched for on YouTube
export function fileSearchOptions(): SearchOptions {
	return {
		searchEngine: QueryType.FILE,
		blockExtractors: [YoutubeExtractor.identifier],
	};
}
