import {
	ChatInputCommandInteraction,
	CacheType,
	VoiceChannel,
	GuildMember,
	EmbedBuilder,
	Guild,
	MessageFlags,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { handledHere } from '../resources/instanceGuard';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export let defaultVc = new Enmap({ name: 'defaultVc' });

export class DefaultVc implements SlashCommand {
	name: string = 'defaultvc';
	description =
		'[MANAGER] Set voice channel for Mirror to join upon restart, will not play an intro';
	options: (Option | Subcommand)[] = [
		new Option(
			'channel',
			'The channel you wish to designate as the default',
			ApplicationCommandOptionType.Channel,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			//Administrator applies to the whole server, so it's checked there rather than on the
			//channel the command was typed in, which may be a thread or a voice channel's chat
			if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			let channel = interaction.options.getChannel('channel');
			if (!(channel instanceof VoiceChannel)) {
				interaction.reply({
					content: 'Channel must be a voice channel',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			if (!interaction.guild?.members.me?.permissionsIn(channel.id).has([PermissionFlagsBits.Connect, PermissionFlagsBits.Speak])) {
				interaction.reply({
					content: 'I need permission to Connect and Speak in that VC',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			defaultVc.set(interaction.guild!.id, channel.id);
			let embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Sucessfully updated your default voice channel to ${channel}`
				);
			interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}

//joins every server's default channel at startup. an idle queue keeps Mirror sitting in the
//channel, ready for music or intros
export async function launchVoice(bot: Bot): Promise<void> {
	await Promise.all(
		[...defaultVc.keys()].map(async (guildId) => {
			//a debug copy neither joins other servers nor forgets their settings
			if (!handledHere(bot, guildId.toString())) return;
			const guild = bot.client.guilds.cache.get(guildId.toString());
			if (!guild) {
				//Mirror was removed from that server
				defaultVc.delete(guildId);
				return;
			}
			//a server Discord can't reach right now is joined when it comes back (guildAvailable)
			if (!guild.available) return;
			if (!(await joinDefaultVoice(bot, guild))) rejoinDefaultVoice(bot, guild.id);
		})
	);
}

//Mirror loses its voice connections when its own connection to Discord has to start over, or when
//a voice connection breaks for good. servers with a default channel get Mirror back afterwards, but
//not after someone disconnects it or uses /leave on purpose
export function watchDefaultVoice(bot: Bot) {
	const comeBack = (guild: Guild) => {
		if (!handledHere(bot, guild.id) || leftServers.has(guild.id)) return;
		if (defaultVc.has(guild.id) && !guild.members.me?.voice.channelId) rejoinDefaultVoice(bot, guild.id);
	};
	bot.client.on('shardReady', () => bot.client.guilds.cache.forEach(comeBack));
	bot.client.on('guildAvailable', comeBack);
}

//servers where Mirror was sent out of voice on purpose (/leave, /destroyqueue, a moderator's
//Disconnect). it stays out until it's brought back into a channel. forgotten on restart, when Mirror
//joins its default channels again as it always has
const leftServers = new Set<string>();
export function leftOnPurpose(guildId: string) {
	leftServers.add(guildId);
	clearTimeout(rejoinTimers.get(guildId));
	rejoinTimers.delete(guildId);
}
export function stayedIn(guildId: string) {
	leftServers.delete(guildId);
}

//tries again later, backing off, until Mirror is back in the default channel or in any channel
const rejoinDelays = [10, 30, 60, 300, 300, 300]; //seconds
const rejoinTimers = new Map<string, NodeJS.Timeout>();
export function rejoinDefaultVoice(bot: Bot, guildId: string, attempt = 0) {
	if (!handledHere(bot, guildId) || leftServers.has(guildId)) return;
	if (!defaultVc.has(guildId) || rejoinTimers.has(guildId) || attempt >= rejoinDelays.length) return;
	const timer = setTimeout(async () => {
		rejoinTimers.delete(guildId);
		const guild = bot.client.guilds.cache.get(guildId);
		//someone brought Mirror into a channel in the meantime
		if (!guild?.available || guild.members.me?.voice.channelId || bot.player.isJoining(guildId)) return;
		if (!(await joinDefaultVoice(bot, guild))) rejoinDefaultVoice(bot, guildId, attempt + 1);
	}, rejoinDelays[attempt] * 1000);
	timer.unref();
	rejoinTimers.set(guildId, timer);
}

//returns false when the join should be tried again later
async function joinDefaultVoice(bot: Bot, guild: Guild): Promise<boolean> {
	const channel = guild.channels.cache.get(String(defaultVc.get(guild.id)));
	if (!channel?.isVoiceBased()) {
		//the channel was deleted. only forget it when the server is fully loaded: during a Discord
		//outage a server is listed without its channels, and the setting would be lost for nothing
		if (guild.available) {
			defaultVc.delete(guild.id);
			bot.logger.warn(`[${guild.name}] The default voice channel no longer exists, so it was forgotten`);
		}
		return true;
	}
	try {
		await bot.player.joinVoice(bot.player.nodes.create(guild, bot.player.playOptions), channel);
		return true;
	} catch (err) {
		bot.logger.warn(
			`[${guild.name}] Could not join the default voice channel ${channel.name}: ${err instanceof Error ? err.message : err}`
		);
		return false;
	}
}
