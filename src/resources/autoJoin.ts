//Mirror joining voice by itself (/autojoin). Discord shows a voice channel as in use while anyone is
//in it, Mirror included, so Mirror only sits in voice while people are there: with auto-join on it
//follows the first person into a voice channel, and it leaves any channel once it has been empty for
//a little while (the player's emptyChannel event, in CustomPlayer)
import Enmap from 'enmap';
import { ChannelType, Guild, VoiceBasedChannel, VoiceChannel, VoiceState } from 'discord.js';
import { VoiceConnectionStatus } from 'discord-voip';
import { Bot } from '../Bot';
import { handledHere } from './instanceGuard';

//per server: whether Mirror joins voice by itself. off unless a manager turns it on
export const autoJoin = new Enmap({ name: 'autoJoin' });
export function autoJoinOn(guildId: string): boolean {
	return autoJoin.get(guildId) === true;
}

//the channel each server picked with the old /defaultvc. servers that set one wanted Mirror in voice,
//so they start with auto-join on. the old setting is only read, never removed, so an older version
//of Mirror still finds it
function carryOverDefaultChannels() {
	const oldDefaultVc = new Enmap({ name: 'defaultVc' });
	for (const guildId of oldDefaultVc.keys()) {
		if (!autoJoin.has(String(guildId))) autoJoin.set(String(guildId), true);
	}
}

//whether Mirror really is in a voice channel in this server. Discord's word for it isn't enough: right
//after a restart it can still show Mirror in the channel the last run was in, with no connection
//behind it, and Mirror would never follow anyone in
export function inVoice(bot: Bot, guild: Guild): boolean {
	const connection = bot.player.nodes.get(guild.id)?.connection;
	return !!connection && connection.state.status !== VoiceConnectionStatus.Destroyed;
}

//people, not bots, in a voice channel
function peopleIn(channel: VoiceBasedChannel): number {
	return channel.members.filter((member) => !member.user.bot).size;
}

//a channel Mirror would follow people into: an ordinary voice channel (not a stage, not the AFK
//channel) that Mirror may join and speak in
function followable(channel: VoiceBasedChannel | null | undefined): channel is VoiceChannel {
	return (
		!!channel &&
		channel.type === ChannelType.GuildVoice &&
		channel.id !== channel.guild.afkChannelId &&
		channel.joinable &&
		channel.speakable
	);
}

//the channel with the most people in it, for when Mirror comes back without anyone having just joined
function busiestChannel(guild: Guild): VoiceChannel | undefined {
	let busiest: VoiceChannel | undefined;
	for (const channel of guild.channels.cache.values()) {
		if (!channel.isVoiceBased() || !followable(channel) || peopleIn(channel) === 0) continue;
		if (!busiest || peopleIn(channel) > peopleIn(busiest)) busiest = channel;
	}
	return busiest;
}

//servers where Mirror was sent out of voice on purpose (/leave, /destroyqueue, a moderator's
//Disconnect). it stays out until it's brought back into a channel, or everyone has left voice and
//people gather again. forgotten on restart
const leftServers = new Set<string>();
export function leftOnPurpose(guildId: string) {
	leftServers.add(guildId);
	clearTimeout(rejoinTimers.get(guildId));
	rejoinTimers.delete(guildId);
}
export function stayedIn(guildId: string) {
	leftServers.delete(guildId);
}

//called for every change in a person's voice state, before intros are considered, so the person who
//brings Mirror in hears their own intro
export async function followPeople(bot: Bot, oldState: VoiceState, newState: VoiceState) {
	const guild = newState.guild;
	//everyone has left voice: whoever gathers next brings Mirror back, even if it was sent away with
	///leave while they were last there
	if (oldState.channelId && !newState.channelId) {
		const anyoneLeft = guild.channels.cache.some((channel) => channel.isVoiceBased() && peopleIn(channel) > 0);
		if (!anyoneLeft) leftServers.delete(guild.id);
		return;
	}
	if (!newState.channelId || oldState.channelId === newState.channelId) return;
	if (!autoJoinOn(guild.id) || !followable(newState.channel)) return;
	//Mirror is busy elsewhere, on its way, or was sent away while people are still here
	if (inVoice(bot, guild) || bot.player.isJoining(guild.id) || leftServers.has(guild.id)) return;
	await joinPeople(bot, guild, newState.channel);
}

//joins the given channel, or the busiest one when none is given, if auto-join is on and people are
//there. returns false when it should be tried again later
export async function joinPeople(bot: Bot, guild: Guild, channel?: VoiceChannel): Promise<boolean> {
	if (!autoJoinOn(guild.id) || !handledHere(bot, guild.id)) return true;
	const target = channel ?? busiestChannel(guild);
	if (!target || peopleIn(target) === 0) return true;
	try {
		await bot.player.joinVoice(bot.player.nodes.create(guild, bot.player.playOptions), target);
		return true;
	} catch (err) {
		bot.logger.warn(
			`[${guild.name}] Could not follow people into ${target.name}: ${err instanceof Error ? err.message : err}`
		);
		return false;
	}
}

//tries again later, backing off, until Mirror is back with people or in any channel
const rejoinDelays = [10, 30, 60, 300, 300, 300]; //seconds
const rejoinTimers = new Map<string, NodeJS.Timeout>();
export function rejoinPeople(bot: Bot, guildId: string, attempt = 0) {
	if (!handledHere(bot, guildId) || !autoJoinOn(guildId) || leftServers.has(guildId)) return;
	if (rejoinTimers.has(guildId) || attempt >= rejoinDelays.length) return;
	const timer = setTimeout(async () => {
		rejoinTimers.delete(guildId);
		const guild = bot.client.guilds.cache.get(guildId);
		//someone brought Mirror into a channel in the meantime
		if (!guild?.available || inVoice(bot, guild) || bot.player.isJoining(guildId)) return;
		if (!(await joinPeople(bot, guild))) rejoinPeople(bot, guildId, attempt + 1);
	}, rejoinDelays[attempt] * 1000);
	timer.unref();
	rejoinTimers.set(guildId, timer);
}

//at startup: joins people already in voice in every server with auto-join on, and comes back after
//Mirror's own connection to Discord has had to start over (a moderator's Disconnect or /leave keeps
//it out, see leftServers)
export async function startAutoJoin(bot: Bot): Promise<void> {
	carryOverDefaultChannels();
	const comeBack = (guild: Guild) => {
		if (handledHere(bot, guild.id) && autoJoinOn(guild.id) && !inVoice(bot, guild) && !leftServers.has(guild.id))
			rejoinPeople(bot, guild.id);
	};
	bot.client.on('shardReady', () => bot.client.guilds.cache.forEach(comeBack));
	bot.client.on('guildAvailable', comeBack);
	await Promise.all(
		[...bot.client.guilds.cache.values()]
			.filter((guild) => guild.available && handledHere(bot, guild.id) && autoJoinOn(guild.id))
			.map(async (guild) => {
				if (!(await joinPeople(bot, guild))) rejoinPeople(bot, guild.id);
			})
	);
}
