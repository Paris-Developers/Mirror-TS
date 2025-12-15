
import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	ChannelType,
	VoiceChannel,
	Guild
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
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
			let member = interaction.member;
			if (
				!(member as any).permissions.has(PermissionFlagsBits.Administrator)
			) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}
			let channel = interaction.options.getChannel('channel');
			if (!channel || channel.type !== ChannelType.GuildVoice) {
				interaction.reply({
					content: 'Channel must be a voice channel',
					ephemeral: true,
				});
				return;
			}
			if (!channel || !interaction.guild?.members.me?.permissionsIn(channel.id).has(PermissionFlagsBits.Connect)) {
				interaction.reply({
					content: 'I do not have permission to Connect to that VC',
					ephemeral: true,
				});
				return;
			}
			defaultVc.set(interaction.guild!.id, channel!.id);
			let embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Sucessfully updated your default voice channel to ${channel} `
				);
			interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}

export async function launchVoice(bot: Bot): Promise<void> {
	(defaultVc as any).forEach((channel: string, guild: string) => {
		let guildCheck = bot.client.guilds.cache.get(guild.toString()) as Guild;
		if (!guildCheck) return defaultVc.delete(guild);
		const connection = joinVoiceChannel({
			channelId: channel,
			guildId: guildCheck.id,
			adapterCreator: guildCheck.voiceAdapterCreator,
		});
		//code copied from discord#9185
		//@ts-ignore
		connection.on("stateChange", (oldState, newState) => {
			const oldNetworking = Reflect.get(oldState, 'networking');
			const newNetworking = Reflect.get(newState, 'networking');

			const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
				const newUdp = Reflect.get(newNetworkState, 'udp');
				clearInterval(newUdp?.keepAliveInterval);
			}

			oldNetworking?.off('stateChange', networkStateChangeHandler);
			newNetworking?.on('stateChange', networkStateChangeHandler);
		});
		let player = createAudioPlayer();
		connection.subscribe(player);
	});
}
