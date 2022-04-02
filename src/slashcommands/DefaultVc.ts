import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	VoiceChannel,
	GuildMember,
	TextChannel,
	MessageEmbed,
	Guild,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export let defaultVc = new Enmap('defaultVc');

export class DefaultVc implements SlashCommand {
	name: string = 'defaultvc';
	description =
		'[MANAGER] Set voice channel for Mirror to join upon restart, will not play an intro';
	options: (Option | Subcommand)[] = [
		new Option(
			'channel',
			'The channel you wish to designate as the default',
			ApplicationCommandOptionTypes.CHANNEL,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			if (
				!(interaction.channel instanceof TextChannel) ||
				!member.permissionsIn(interaction.channel!).has('ADMINISTRATOR')
			) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}
			let channel = interaction.options.getChannel('channel');
			if (!(channel instanceof VoiceChannel)) {
				interaction.reply({
					content: 'Channel must be a voice channel',
					ephemeral: true,
				});
				return;
			}
			if (!interaction.guild?.me?.permissionsIn(channel.id).has('CONNECT')) {
				interaction.reply({
					content: 'I do not have permission to Connect to that VC',
					ephemeral: true,
				});
				return;
			}
			defaultVc.set(interaction.guild!.id, channel.id);
			let embed = new MessageEmbed()
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
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}

export async function launchVoice(bot: Bot): Promise<void> {
	defaultVc.forEach((channel, guild) => {
		let guildCheck = bot.client.guilds.cache.get(guild.toString()) as Guild;
		if (!guildCheck) return defaultVc.delete(guild);
		const connection = joinVoiceChannel({
			channelId: channel,
			guildId: guildCheck.id,
			adapterCreator: guildCheck.voiceAdapterCreator,
		});
		let player = createAudioPlayer();
		connection.subscribe(player);
	});
}
