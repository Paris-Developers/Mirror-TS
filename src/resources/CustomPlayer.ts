import { Bot } from '../Bot';
import { GuildNodeCreateOptions, GuildQueue, Player, QueueRepeatMode } from 'discord-player';
import {
	ChannelType,
	Guild,
	PermissionFlagsBits,
	User,
	VoiceBasedChannel,
	VoiceState,
} from 'discord.js';
import {
	AudioPlayerStatus,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionState,
	VoiceConnectionStatus,
	entersState,
} from 'discord-voip';
import { YoutubeExtractor } from 'discord-player-youtubei';
import { fileSearchOptions, registerExtractors, userSearchOptions } from './extractors';
import { playerErrors, tracksStarted } from './metrics';
import { endCard, registerNowPlaying } from './nowPlaying';
import { leftOnPurpose, rejoinDefaultVoice, stayedIn } from '../slashcommands/DefaultVc';

//a join that failed for a reason worth telling the person who asked. the message is written for them
export class VoiceJoinError extends Error {}

//a queue is busy while music is playing, loaded, or still being fetched. sound effects and intros
//wait for it, and nothing moves Mirror away from it
export function queueBusy(queue: GuildQueue | null | undefined): boolean {
	return (
		!!queue &&
		(queue.isPlaying() ||
			!!queue.currentTrack ||
			queue.tracks.size > 0 ||
			queue.tasksQueue.size > 0 ||
			(queue.player as CustomPlayer).isStarting?.(queue))
	);
}

//on a stage Mirror is heard only once a stage moderator lets it speak
export function stageNotice(guild: Guild): string | undefined {
	const voice = guild.members.me?.voice;
	if (voice?.channel?.type === ChannelType.GuildStageVoice && voice.suppress)
		return 'Mirror has asked to speak on the stage. A stage moderator needs to accept before anyone can hear it.';
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

//voice debug output repeats the connection's secrets; they never go in a log file
function redact(message: string): string {
	return message
		.replace(/"(token|session_id|sessionId)":"[^"]*"/g, '"$1":"[hidden]"')
		.replace(/"(secretKey|secret_key)":(\{[^}]*\}|\[[^\]]*\])/g, '"$1":"[hidden]"');
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
		//a join that cannot finish should fail quickly so it can be tried again, rather than sitting
		//in a half joined state for the two minutes the player allows by default
		connectionTimeout: 20 * 1000,
		//when YouTube can't send a song, the player would otherwise search SoundCloud for its title and
		//quietly play whatever it finds, often a cover, and the card would never say the song failed
		disableFallbackStream: true,
		//someone dropping out for a moment (a phone reconnecting) shouldn't count as everyone leaving
		leaveOnEmptyCooldown: 30 * 1000,
	};

	//the join each server is working through. joins in one server wait their turn: two at once
	//would each take the other's connection down
	private joins = new Map<string, Promise<GuildQueue>>();
	private watched = new WeakSet<VoiceConnection>();
	private recovering = new WeakSet<VoiceConnection>();
	private resuming = new WeakSet<GuildQueue>();
	//queues Mirror threw away itself after a join gave up; the next join in line starts a fresh one
	private abandoned = new WeakSet<GuildQueue>();
	//queues whose first song is on its way. nothing counts as playing until its audio arrives, and a
	//song that fails hands over to the next one in the background, so this is what says "wait"
	private starting = new WeakSet<GuildQueue>();

	isJoining(guildId: string): boolean {
		return this.joins.has(guildId);
	}

	isStarting(queue: GuildQueue): boolean {
		return this.starting.has(queue);
	}

	//starts the queue's next song, and counts the queue as busy until a song really plays or the
	//queue runs out
	async startPlaying(queue: GuildQueue): Promise<void> {
		this.starting.add(queue);
		//a backstop in case neither happens
		setTimeout(() => this.starting.delete(queue), 3 * 60 * 1000).unref();
		try {
			await queue.node.play();
		} catch (error) {
			this.starting.delete(queue);
			throw error;
		}
	}

	//joining voice is the most fragile thing Mirror does. It opens a second connection, to one of
	//Discord's voice servers, and has to finish a handshake over it. A moment of bad network loses
	//that handshake, so the join is tried again rather than giving up on the first attempt.
	//
	//connect() comes back as soon as Discord has been asked to move the bot, long before the voice
	//server has answered, so waiting for the connection to be ready is what actually catches a
	//failed handshake. Without that wait the failure lands much later, while a song is starting.
	//
	//returns the queue to carry on with, which is a new one if the queue passed in was thrown away
	//while waiting. a VoiceJoinError explains itself to the user; anything else is unexpected
	//move: false keeps Mirror where it is if it's already in another channel by the time this join's
	//turn comes (an intro shouldn't pull Mirror back from where someone just brought it)
	async joinVoice(
		queue: GuildQueue,
		channel: VoiceBasedChannel | null | undefined,
		{ move = true }: { move?: boolean } = {}
	): Promise<GuildQueue> {
		if (!channel) throw new VoiceJoinError('Join a voice channel first.');
		const guildId = channel.guild.id;
		const earlier = this.joins.get(guildId);
		const join = (async () => {
			await earlier?.catch(() => {});
			const current = channel.guild.members.me?.voice.channelId;
			if (!move && current && current !== channel.id)
				throw new VoiceJoinError(`Mirror has moved to <#${current}> in the meantime.`);
			return this.connectTo(queue, channel);
		})();
		this.joins.set(guildId, join);
		try {
			return await join;
		} finally {
			if (this.joins.get(guildId) === join) this.joins.delete(guildId);
		}
	}

	private async connectTo(
		queue: GuildQueue,
		channel: VoiceBasedChannel,
		attempts = 3,
		readyTimeout = 15 * 1000
	): Promise<GuildQueue> {
		const guild = channel.guild;
		//a channel Mirror already sits in needs no checks: a full channel counts Mirror itself
		if (guild.members.me?.voice.channelId !== channel.id) this.checkCanJoin(channel);

		for (let attempt = 1; ; attempt++) {
			queue = this.liveQueue(queue, attempt);
			let connection = queue.connection;
			//a connection destroyed underneath the queue can't come back, so a new one is made
			if (connection?.state.status === VoiceConnectionStatus.Destroyed) {
				queue.dispatcher?.destroy();
				connection = null;
			}
			try {
				//where Discord says Mirror is. the connection's own idea changes as soon as a move is asked
				//for, so a move Discord never carried out would otherwise pass for done on the next try
				const confirmed = guild.members.me?.voice.channelId;
				if (!connection) {
					await queue.connect(channel);
				} else if (connection.joinConfig.channelId !== channel.id || (confirmed && confirmed !== channel.id)) {
					if (queueBusy(queue))
						throw new VoiceJoinError(
							`Mirror is busy playing music in <#${confirmed ?? connection.joinConfig.channelId}>. Join it there, or wait for the music to finish.`
						);
					//the connection still looks ready from the old channel until the new channel's voice
					//server answers, so the move waits a moment for that handshake to begin
					const handshake = this.waitForStateChange(connection, 5000);
					//move without leaving first: Discord would report the leave as a disconnect, and the
					//queue would be thrown away halfway through the move
					const moving = connection.rejoin({
						channelId: channel.id,
						selfDeaf: connection.joinConfig.selfDeaf,
						selfMute: false,
					});
					if (!moving) throw new Error('the connection to Discord is down');
					await this.waitForBotIn(guild, channel.id, readyTimeout);
					await handshake;
				}
				await entersState(queue.connection!, VoiceConnectionStatus.Ready, readyTimeout);
				await this.askToSpeak(channel);
				stayedIn(guild.id);
				return queue;
			} catch (error) {
				if (error instanceof VoiceJoinError) throw error;
				const status = queue.connection?.state.status ?? 'not connected';
				const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
				if (attempt >= attempts) {
					this.bot.logger.warn(
						`[${guild.name}] Gave up joining ${channel.name} after ${attempts} tries: ${reason} (voice ${status})`
					);
					await this.abandonJoin(queue);
					throw new VoiceJoinError(
						`Couldn't connect to ${channel}: Discord's voice server didn't answer. Try again in a moment.`
					);
				}
				this.bot.logger.warn(
					`[${guild.name}] Could not join ${channel.name} (try ${attempt} of ${attempts}): ${reason} (voice ${status}). Trying again`
				);
				//redo the handshake without leaving the channel. leaving would come back from Discord as
				//a disconnect, and the queue would be thrown away while the next try was using it
				const current = queue.connection;
				if (current && current.state.status !== VoiceConnectionStatus.Destroyed) current.rejoin();
				await wait(attempt * 1000);
			}
		}
	}

	//joins that can never work are refused straight away, with the reason, instead of timing out
	//three times. when Mirror's permissions aren't known yet the join just goes ahead
	private checkCanJoin(channel: VoiceBasedChannel) {
		const me = channel.guild.members.me;
		const permissions = me ? channel.permissionsFor(me) : null;
		if (!permissions) return;
		if (channel.id === channel.guild.afkChannelId)
			throw new VoiceJoinError(`Mirror can't play sounds in the AFK channel.`);
		if (!permissions.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]))
			throw new VoiceJoinError(`Mirror isn't allowed to join ${channel}.`);
		if (!channel.joinable)
			throw new VoiceJoinError(
				channel.full ? `${channel} is full.` : `Mirror isn't allowed to join ${channel}.`
			);
		//on a stage speaking is up to the stage moderators, which askToSpeak handles
		if (channel.type === ChannelType.GuildVoice && !channel.speakable)
			throw new VoiceJoinError(`Mirror can join ${channel} but isn't allowed to speak there.`);
	}

	//on a stage Mirror starts out in the audience. it moves itself up when it may, and asks otherwise
	private async askToSpeak(channel: VoiceBasedChannel) {
		if (channel.type !== ChannelType.GuildStageVoice) return;
		const voice = channel.guild.members.me?.voice;
		if (!voice?.suppress) return;
		await voice.setSuppressed(false).catch(() => voice.setRequestToSpeak(true).catch(() => {}));
	}

	//the join before this one may have thrown its queue away; carry on with the server's live queue.
	//a queue removed partway through this join was removed on purpose (/leave, /destroyqueue, a
	//moderator's Disconnect), and the join stops rather than bringing Mirror back
	private liveQueue(queue: GuildQueue, attempt: number): GuildQueue {
		if (!queue.deleted && this.nodes.get(queue.guild.id) === queue) return queue;
		if (attempt > 1 && !this.abandoned.has(queue))
			throw new VoiceJoinError('Mirror was disconnected while it was joining.');
		return this.nodes.create(queue.guild, { ...this.playOptions, metadata: queue.metadata });
	}

	//a join that gave up leaves the channel, rather than leaving a half open connection that keeps
	//trying and that the next join would pick up. music already on the queue keeps its connection;
	//the watchdog looks after that one
	private async abandonJoin(queue: GuildQueue) {
		if (queueBusy(queue)) return;
		this.abandoned.add(queue);
		if (!queue.deleted && this.nodes.get(queue.guild.id) === queue) queue.delete();
		else if (queue.dispatcher) queue.dispatcher.destroy();
		else return;
		//Discord confirms the leave a moment later. the next join waits for that, so it doesn't take
		//the confirmation for a disconnect of its own
		await this.waitForBotIn(queue.guild, null, 3000).catch(() => {});
		//a server with a default channel gets Mirror back once voice works again
		rejoinDefaultVoice(this.bot, queue.guild.id);
	}

	//resolves on the connection's next change of status, or after ms, whichever comes first
	private waitForStateChange(connection: VoiceConnection, ms: number): Promise<void> {
		return new Promise((resolve) => {
			const listener = (oldState: VoiceConnectionState, newState: VoiceConnectionState) => {
				if (oldState.status !== newState.status) done();
			};
			const timer = setTimeout(() => done(), ms);
			const done = () => {
				clearTimeout(timer);
				connection.off('stateChange', listener);
				resolve();
			};
			connection.on('stateChange', listener);
		});
	}

	//resolves true once the connection is ready, false if it's destroyed or ms pass first. unlike
	//entersState it doesn't give up on the first error: a connection that's reconnecting reports one
	//for every try that fails, and those tries are the point of waiting
	private waitForReady(connection: VoiceConnection, ms: number): Promise<boolean> {
		if (connection.state.status === VoiceConnectionStatus.Ready) return Promise.resolve(true);
		return new Promise((resolve) => {
			const listener = (_old: VoiceConnectionState, state: VoiceConnectionState) => {
				if (state.status === VoiceConnectionStatus.Ready) done(true);
				else if (state.status === VoiceConnectionStatus.Destroyed) done(false);
			};
			const timer = setTimeout(() => done(false), ms);
			const done = (ready: boolean) => {
				clearTimeout(timer);
				connection.off('stateChange', listener);
				resolve(ready);
			};
			connection.on('stateChange', listener);
		});
	}

	//resolves once Discord reports Mirror in the given channel (null for no channel)
	private waitForBotIn(guild: Guild, channelId: string | null, ms: number): Promise<void> {
		if ((guild.members.me?.voice.channelId ?? null) === channelId) return Promise.resolve();
		const client = this.bot.client;
		return new Promise((resolve, reject) => {
			const listener = (_old: VoiceState, state: VoiceState) => {
				if (state.guild.id !== guild.id || state.id !== client.user?.id) return;
				if ((state.channelId ?? null) === channelId) done();
			};
			const timer = setTimeout(
				() => done(new Error(`Discord didn't move Mirror within ${ms / 1000} seconds`)),
				ms
			);
			const done = (error?: Error) => {
				clearTimeout(timer);
				client.off('voiceStateUpdate', listener);
				if (error) reject(error);
				else resolve();
			};
			client.on('voiceStateUpdate', listener);
		});
	}

	//the extractors themselves are set up in extractors.ts
	async loadExtractors(): Promise<void> {
		//the player and extractors explain what they're doing through debug messages; listen before
		//they start up. download failures are logged as warnings by youtubeStream itself
		this.on('debug', (message) => {
			//errors come through this event too, despite the string signature
			const text =
				typeof message === 'string'
					? message
					: String((message as unknown as Error)?.message ?? message);
			this.bot.logger.debug(text);
		});
		this.on('error', (error) => this.bot.logger.error(error));
		//each server's queue and voice connection explain themselves too, but only to a listener that
		//exists before the connection is made. it is a lot of output, so only in debug mode
		if (this.bot.mode == 'debug') {
			this.events.on('debug', (queue, message) => {
				//voice heartbeats go back and forth every few seconds and would bury everything else
				if (/"op":\s*[36][,}]/.test(message)) return;
				this.bot.logger.debug(`[${queue.guild.name}] ${redact(message)}`);
			});
		}
		await registerExtractors(this, this.bot);
	}

	//looks up a song name or link typed by a user (/play, /playnext, /intro)
	async searchFromUser(query: string, requestedBy: User) {
		//right after startup YouTube may still be connecting, and searching it then fails with a
		//confusing error. /play says to try again in a moment instead
		const youtube = this.extractors.get(YoutubeExtractor.identifier) as YoutubeExtractor | undefined;
		if (youtube && !youtube.innertube) throw new Error('YouTube is still connecting');
		return this.search(query, userSearchOptions(requestedBy));
	}

	//plays a sound file from disk (intro themes, the sound effect commands)
	async playFile(channel: VoiceBasedChannel, file: string, options: { move?: boolean } = {}) {
		//play() joins by itself if the queue isn't connected, with no second try when the handshake
		//fails, and it never moves an existing connection, so the join happens here first
		await this.joinVoice(this.nodes.create(channel.guild, this.playOptions), channel, options);
		const result = await this.play(channel, file, {
			...fileSearchOptions(),
			nodeOptions: this.playOptions,
		});
		this.bot.logger.debug(
			`Playing ${file} in ${channel.name}: resolved as ${result.track.title}`
		);
		return result;
	}

	registerPlayerEvents() {
		//throw the queue away once Mirror is disconnected. the library has already let go of the
		//connection by then
		this.events.on('disconnect', (queue) => {
			//someone disconnected Mirror (or it was kicked), so it doesn't return to a default channel by itself
			leftOnPurpose(queue.guild.id);
			this.discardQueue(queue);
		});

		//everyone left: stop the music but stay in the channel, so intros play for whoever comes back
		//and /defaultvc keeps Mirror where it was put. an empty queue also lets people in another
		//channel pull Mirror over with /join
		this.events.on('emptyChannel', (queue) => {
			if (!queue.currentTrack && !queue.tracks.size) return;
			void endCard(this.bot, queue.guild.id, 'Stopped because everyone left the voice channel');
			if (queue.repeatMode) queue.setRepeatMode(QueueRepeatMode.OFF);
			//a paused song never reaches its end, so it has to be unpaused to be stopped
			if (queue.node.isPaused()) queue.node.setPaused(false);
			queue.node.stop();
		});

		this.events.on('playerStart', (queue) => {
			this.starting.delete(queue);
			tracksStarted.inc({ guild: queue.guild.name });
		});
		//the song that was starting failed with nothing after it, or the queue went away
		this.events.on('emptyQueue', (queue) => this.starting.delete(queue));
		this.events.on('queueDelete', (queue) => this.starting.delete(queue));

		//errors here are mostly voice hiccups the connection recovers from by itself, and a song that
		//fails is skipped by the player. neither is a reason to throw the queue away and leave
		this.events.on('error', (queue, error) => {
			playerErrors.inc({ kind: 'queue' });
			this.bot.logger.error(
				`[${queue.guild.name}] Error emitted from the queue (voice ${queue.connection?.state.status ?? 'not connected'}): ${error.stack ?? error.message}`
			);
			void this.resumeStalledTrack(queue);
		});

		//the player moves on to the next song by itself after a song fails, so skipping here as well
		//would skip a second song. only a failed song that is somehow still playing gets skipped
		this.events.on('playerError', (queue, error, track) => {
			playerErrors.inc({ kind: 'track' });
			if (queue.currentTrack === track && queue.node.isPlaying()) queue.node.skip();
			this.bot.logger.error(
				`[${queue.guild.name}] Error emitted from the player: ${error.message}`
			);
		});

		this.events.on('connection', (queue) => this.watchConnection(queue));
		//after the bot's own connection to Discord comes back, voice connections that tried to
		//reconnect while it was down are nudged again. until then Discord never heard them ask
		const nudge = () =>
			this.nodes.cache.forEach((queue) => {
				const connection = queue.connection;
				if (connection && this.waitingOnGateway(connection) && !this.isJoining(queue.guild.id))
					connection.rejoin();
			});
		this.bot.client.on('shardResume', nudge);
		this.bot.client.on('shardReady', nudge);

		registerNowPlaying(this.bot);
	}

	//a song whose audio arrived while voice wasn't ready is left half started: the player stays idle
	//and the queue counts as playing, so nothing would ever start it. once voice is back it is played
	private async resumeStalledTrack(queue: GuildQueue) {
		const dispatcher = queue.dispatcher;
		const resource = dispatcher?.audioResource;
		if (!dispatcher || !resource || resource.ended || this.resuming.has(queue)) return;
		if (dispatcher.audioPlayer.state.status !== AudioPlayerStatus.Idle) return;
		this.resuming.add(queue);
		try {
			//the watchdog gives voice about a minute to come back; if it comes back later than this,
			//its return to ready calls this again
			if (!(await this.waitForReady(dispatcher.voiceConnection, 60 * 1000))) return;
			if (queue.deleted || queue.dispatcher !== dispatcher || dispatcher.audioResource !== resource) return;
			if (dispatcher.audioPlayer.state.status !== AudioPlayerStatus.Idle) return;
			this.bot.logger.info(`[${queue.guild.name}] Voice is back, starting the song that was waiting`);
			await dispatcher.playStream(resource);
		} catch {
			//voice never came back; the watchdog decides what happens to the connection
		} finally {
			this.resuming.delete(queue);
		}
	}

	//watches a voice connection after it first works. a connection that drops is given about a
	//minute to come back, helped along with a rejoin, and is closed if it can't, so Mirror doesn't
	//sit silent in a channel until someone notices
	private watchConnection(queue: GuildQueue) {
		const connection = queue.connection;
		if (!connection || this.watched.has(connection)) return;
		this.watched.add(connection);
		connection.on('stateChange', (oldState, newState) => {
			if (oldState.status === newState.status) return;
			//a song left waiting while voice was down starts as soon as voice is back
			if (newState.status === VoiceConnectionStatus.Ready) void this.resumeStalledTrack(queue);
			const code = 'closeCode' in newState ? ` (code ${newState.closeCode})` : '';
			this.bot.logger.info(
				`[${queue.guild.name}] Voice ${oldState.status} -> ${newState.status}${code}`
			);
			//some close codes make the library reconnect instantly, forever
			if (newState.status === VoiceConnectionStatus.Signalling && connection.rejoinAttempts > 10) {
				setImmediate(() => this.giveUp(queue, connection, 'it kept reconnecting'));
				return;
			}
			if (oldState.status === VoiceConnectionStatus.Ready && newState.status !== VoiceConnectionStatus.Destroyed)
				void this.recoverConnection(queue, connection);
		});
	}

	private async recoverConnection(queue: GuildQueue, connection: VoiceConnection) {
		if (this.recovering.has(connection)) return;
		this.recovering.add(connection);
		try {
			//ordinary hiccups, like a voice server moving, settle within a few seconds
			for (let round = 1; round <= 3; round++) {
				const ready = await this.waitForReady(connection, 20 * 1000);
				if (ready || this.lostInterest(queue, connection)) return;
				//a join in progress is already working on this connection
				if (this.isJoining(queue.guild.id)) continue;
				const state = connection.state;
				this.bot.logger.warn(
					`[${queue.guild.name}] Voice has been ${state.status} for 20 seconds, rejoining (try ${round} of 3)`
				);
				//kicked or moved out (code 4014) is handled by the library, and must not pull Mirror back
				const kicked =
					state.status === VoiceConnectionStatus.Disconnected &&
					(state.reason === VoiceConnectionDisconnectReason.WebSocketClose ||
						state.reason === VoiceConnectionDisconnectReason.Manual);
				if (!kicked) connection.rejoin();
			}
			if (!this.lostInterest(queue, connection))
				this.giveUp(queue, connection, 'it stayed disconnected for a minute');
		} finally {
			this.recovering.delete(connection);
		}
	}

	private giveUp(queue: GuildQueue, connection: VoiceConnection, why: string) {
		if (this.lostInterest(queue, connection)) return;
		this.bot.logger.error(
			`[${queue.guild.name}] Closing the voice connection because ${why} (voice ${connection.state.status})`
		);
		if (queueBusy(queue)) void endCard(this.bot, queue.guild.id, 'Music stopped: the voice connection was lost');
		if (this.nodes.get(queue.guild.id) === queue) queue.delete();
		else queue.dispatcher?.destroy();
		//a server with a default channel gets Mirror back once voice works again
		rejoinDefaultVoice(this.bot, queue.guild.id);
	}

	private lostInterest(queue: GuildQueue, connection: VoiceConnection): boolean {
		return (
			queue.deleted ||
			queue.connection !== connection ||
			connection.state.status === VoiceConnectionStatus.Destroyed
		);
	}

	//a reconnect that couldn't be sent because the bot's own connection to Discord was down
	private waitingOnGateway(connection: VoiceConnection): boolean {
		const state = connection.state;
		if (state.status === VoiceConnectionStatus.Signalling) return true;
		return (
			state.status === VoiceConnectionStatus.Disconnected &&
			(state.reason === VoiceConnectionDisconnectReason.AdapterUnavailable ||
				state.reason === VoiceConnectionDisconnectReason.EndpointRemoved)
		);
	}

	//delete() goes by server, so a queue that has already been replaced must not call it
	private discardQueue(queue: GuildQueue) {
		if (!queue.deleted && this.nodes.get(queue.guild.id) === queue) queue.delete();
	}
}
