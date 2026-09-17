//the now playing card: one message per server that follows the music. it shows the current song and
//what's up next, with buttons to control playback, and it is posted in the channel /play was last
//used in. sound effects and intros play from files on disk and never touch the card
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	ContainerBuilder,
	Message,
	MessageFlags,
	SendableChannels,
	escapeMarkdown,
} from 'discord.js';
import { GuildQueue, QueueRepeatMode, Track } from 'discord-player';
import { Bot } from '../Bot';
import { silenceCheck } from '../slashcommands/SilenceRole';
import { accentColor, addHeading, cardReply, commandMention, divider } from './cards';

//what /play and /playnext store on a server's queue
export type MusicMetadata = { channel?: SendableChannels };

export const nowPlayingButton = 'nowplaying:';
const upNextShown = 5;
const noPings = { allowedMentions: { parse: [] } };

type Played = { title: string; author: string; url: string };
const cards = new Map<string, Message>(); //server id -> its card
const lastPlayed = new Map<string, Played>(); //server id -> the song the card last showed
const lastAction = new Map<string, { text: string; at: number }>(); //server id -> "Skipped by @someone"
const pending = new Map<string, NodeJS.Timeout>(); //server id -> a card update waiting to go out
const failures = new Map<string, { title: string; at: number }>(); //server id -> a song YouTube just wouldn't send

const isSoundFile = (track: Track) => (track.raw as { isFile?: boolean } | undefined)?.isFile === true;

export function registerNowPlaying(bot: Bot) {
	const events = bot.player.events;
	events.on('playerStart', (queue, track) => {
		if (!isSoundFile(track)) refresh(bot, queue);
	});
	for (const event of ['audioTrackAdd', 'audioTracksAdd', 'audioTrackRemove', 'audioTracksRemove', 'playerPause', 'playerResume'] as const) {
		events.on(event, (queue: GuildQueue) => refresh(bot, queue));
	}
	//the player skips a song it couldn't get audio for; the card says so, on the next song or as the queue ends
	events.on('playerSkip', (queue, track, reason) => {
		if (reason !== 'ERR_NO_STREAM' || isSoundFile(track)) return;
		failures.set(queue.guild.id, { title: track.title, at: Date.now() });
		lastAction.set(queue.guild.id, {
			text: `⚠️ Couldn't play ${escapeMarkdown(shorten(track.title))}: YouTube didn't send any audio, so it was skipped`,
			at: Date.now(),
		});
	});
	const channelOf = (queue: GuildQueue) => (queue.metadata as MusicMetadata | null)?.channel;
	events.on('emptyQueue', (queue) => finish(bot, queue.guild.id, 'The queue finished', channelOf(queue)));
	events.on('queueDelete', (queue) => finish(bot, queue.guild.id, 'Music stopped', channelOf(queue)));
}

//several changes often land together (a playlist, a skip starting the next song), so updates wait a
//moment and go out as one edit
function refresh(bot: Bot, queue: GuildQueue) {
	const guildId = queue.guild.id;
	clearTimeout(pending.get(guildId));
	pending.set(
		guildId,
		setTimeout(() => {
			pending.delete(guildId);
			showCard(bot, guildId).catch((error) => bot.logger.error('Could not update the now playing card:', error));
		}, 1000)
	);
}

async function showCard(bot: Bot, guildId: string) {
	const queue = bot.player.nodes.get(guildId);
	const track = queue?.currentTrack;
	if (!queue || !track || isSoundFile(track)) return;
	//music started without /play, such as from the default voice channel, has nowhere to post
	const channel = (queue.metadata as MusicMetadata | null)?.channel;
	if (!channel) return;

	lastPlayed.set(guildId, { title: track.title, author: track.author, url: track.url });
	const card = playingCard(bot, queue);
	const existing = cards.get(guildId);
	if (existing?.channelId === channel.id) {
		try {
			await existing.edit({ components: [card], ...noPings });
			return;
		} catch {
			//the card was deleted, so post a new one
		}
	} else if (existing) {
		await existing.edit({ components: [endedCard(bot, guildId, `Moved to <#${channel.id}>`)], ...noPings }).catch(() => {});
	}
	cards.set(guildId, await channel.send({ components: [card], ...cardReply }));
}

//the card stays in the channel as a record of what played, without its buttons
async function finish(bot: Bot, guildId: string, note: string, channel?: SendableChannels) {
	clearTimeout(pending.get(guildId));
	pending.delete(guildId);
	const card = cards.get(guildId);
	cards.delete(guildId);
	const failure = failures.get(guildId);
	failures.delete(guildId);
	const failedTitle = failure && Date.now() - failure.at < 30 * 1000 ? failure.title : undefined;

	const ended = endedCard(bot, guildId, note, failedTitle);
	if (card) {
		await card.edit({ components: [ended], ...noPings }).catch(() => {});
	} else if (failedTitle && channel) {
		//the song failed before a card was ever posted, so the warning goes out on its own
		await channel
			.send({ components: [ended], ...cardReply })
			.catch((error) => bot.logger.error('Could not post the song failure card:', error));
	}
	lastAction.delete(guildId);
}

function playingCard(bot: Bot, queue: GuildQueue): ContainerBuilder {
	const guildId = queue.guild.id;
	const track = queue.currentTrack!;
	const paused = queue.node.isPaused();
	const looping = queue.repeatMode === QueueRepeatMode.TRACK;

	const details = [escapeMarkdown(track.author), track.duration];
	if (track.requestedBy) details.push(`requested by <@${track.requestedBy.id}>`);
	if (looping) details.push('🔁 looping this song');
	const card = new ContainerBuilder().setAccentColor(accentColor(guildId));
	addHeading(
		card,
		[`## ${paused ? '⏸ Paused' : '🎵 Now playing'}`, `**${songLink(track)}**`, details.join(' · ')].join('\n'),
		webImage(track.thumbnail)
	);
	card.addSeparatorComponents(divider);

	const upNext = queue.tracks.toArray();
	const lines = upNext
		.slice(0, upNextShown)
		.map((song, index) => `${index + 1}. ${escapeMarkdown(shorten(song.title))} · ${escapeMarkdown(song.author)} · ${song.duration}`);
	if (upNext.length > upNextShown) lines.push(`+ ${upNext.length - upNextShown} more`);
	const summary = upNext.length
		? `-# ${upNext.length} ${upNext.length === 1 ? 'song' : 'songs'} queued · ${timeLeft(queue.estimatedDuration)}`
		: `Nothing else queued. Add songs with ${commandMention(bot, 'play')}.`;
	card.addTextDisplayComponents((text) => text.setContent(['### Up next', ...lines, summary].join('\n')));

	//who pressed what, while it's still recent
	const action = lastAction.get(guildId);
	if (action && Date.now() - action.at < 2 * 60 * 1000) {
		card.addTextDisplayComponents((text) => text.setContent(`-# ${action.text}`));
	}

	card.addSeparatorComponents(divider);
	card.addActionRowComponents(
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`${nowPlayingButton}pause`)
				.setEmoji(paused ? '▶️' : '⏸️')
				.setLabel(paused ? 'Resume' : 'Pause')
				.setStyle(ButtonStyle.Primary),
			new ButtonBuilder().setCustomId(`${nowPlayingButton}skip`).setEmoji('⏭️').setLabel('Skip').setStyle(ButtonStyle.Secondary),
			new ButtonBuilder().setCustomId(`${nowPlayingButton}stop`).setEmoji('⏹️').setLabel('Stop').setStyle(ButtonStyle.Danger),
			new ButtonBuilder()
				.setCustomId(`${nowPlayingButton}loop`)
				.setEmoji('🔁')
				.setLabel(looping ? 'Looping' : 'Loop')
				.setStyle(looping ? ButtonStyle.Success : ButtonStyle.Secondary),
			new ButtonBuilder()
				.setCustomId(`${nowPlayingButton}shuffle`)
				.setEmoji('🔀')
				.setLabel('Shuffle')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(upNext.length < 2)
		)
	);
	return card;
}

function endedCard(bot: Bot, guildId: string, note: string, failedTitle?: string): ContainerBuilder {
	const played = lastPlayed.get(guildId);
	const lines = failedTitle
		? [
				`## ⚠️ Couldn't play ${escapeMarkdown(shorten(failedTitle))}`,
				`YouTube didn't send any audio for it. Try ${commandMention(bot, 'play')} again in a minute.`,
		  ]
		: [`## ⏹️ ${note}`];
	if (played && played.title !== failedTitle) {
		lines.push(`Last played: **${songLink(played)}** · ${escapeMarkdown(played.author)}`);
	}
	if (!failedTitle) lines.push(`-# Start more with ${commandMention(bot, 'play')}`);
	return new ContainerBuilder()
		.setAccentColor(accentColor(guildId))
		.addTextDisplayComponents((text) => text.setContent(lines.join('\n')));
}

//pressing a card button. anyone in Mirror's voice channel can use them, the same as the music commands
export async function handleNowPlayingButton(bot: Bot, interaction: ButtonInteraction) {
	const guild = interaction.guild;
	if (!guild) return;
	const queue = bot.player.nodes.get(guild.id);
	if (!queue?.currentTrack || isSoundFile(queue.currentTrack)) {
		//a card left over from music that already ended, or from before the bot restarted
		await interaction.update({ components: [endedCard(bot, guild.id, 'Music stopped')], ...noPings });
		return;
	}

	const deny = (content: string) => interaction.reply({ content, flags: MessageFlags.Ephemeral });
	const member = guild.members.cache.get(interaction.user.id) ?? (await guild.members.fetch(interaction.user.id));
	const mirrorChannel = guild.members.me?.voice.channelId;
	if (!mirrorChannel || member.voice.channelId !== mirrorChannel) {
		await deny(mirrorChannel ? `Join <#${mirrorChannel}> to control the music.` : "Mirror isn't in a voice channel.");
		return;
	}
	if (silenceCheck(interaction)) {
		await deny("Silenced members can't control the music.");
		return;
	}

	const who = `<@${interaction.user.id}>`;
	const note = (text: string) => lastAction.set(guild.id, { text, at: Date.now() });
	switch (interaction.customId.slice(nowPlayingButton.length)) {
		case 'pause':
			if (queue.node.isPaused()) {
				queue.node.setPaused(false);
				note(`▶️ Resumed by ${who}`);
			} else {
				queue.node.setPaused(true);
				note(`⏸️ Paused by ${who}`);
			}
			break;
		case 'skip':
			//skipping a looping song should move on, like /skip
			if (queue.repeatMode) queue.setRepeatMode(QueueRepeatMode.OFF);
			note(`⏭️ ${escapeMarkdown(shorten(queue.currentTrack.title))} skipped by ${who}`);
			await interaction.deferUpdate();
			queue.node.skip();
			return;
		case 'stop':
			//clears the queue and stops, but Mirror stays in the channel
			await interaction.deferUpdate();
			queue.node.stop();
			await finish(bot, guild.id, `Stopped by ${who}`);
			return;
		case 'loop':
			if (queue.repeatMode === QueueRepeatMode.TRACK) {
				queue.setRepeatMode(QueueRepeatMode.OFF);
				note(`🔁 Loop turned off by ${who}`);
			} else {
				queue.setRepeatMode(QueueRepeatMode.TRACK);
				note(`🔁 Loop turned on by ${who}`);
			}
			break;
		case 'shuffle':
			if (queue.tracks.size < 2) {
				await deny('Add a few more songs first.');
				return;
			}
			queue.tracks.shuffle();
			note(`🔀 Queue shuffled by ${who}`);
			break;
		default:
			return;
	}
	await interaction.update({ components: [playingCard(bot, queue)], ...noPings });
}

function songLink(song: { title: string; url: string }): string {
	const title = escapeMarkdown(shorten(song.title).replace(/[[\]]/g, ''));
	return /^https?:\/\//.test(song.url) ? `[${title}](${song.url})` : title;
}

const shorten = (text: string, max = 60) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const webImage = (url: string | undefined) => (url && /^https?:\/\//.test(url) ? url : undefined);

function timeLeft(ms: number): string {
	const minutes = Math.round(ms / 60000);
	if (minutes < 60) return `${minutes} min`;
	return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`;
}
