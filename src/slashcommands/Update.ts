
import { Bot } from '../Bot';

import {
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
	TextChannel,
	GuildMember,
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	ChannelType
} from 'discord.js';
import { SlashCommand } from './SlashCommand';
import config from '../../config.json';
import Enmap from 'enmap';
import { Option, Subcommand } from './Option';

import { colorCheck } from '../resources/embedColorCheck';

export let updateChannels = new Enmap({ name: 'updateChannels' });

export class Update implements SlashCommand {
	public name = 'update';
	description: string =
		'[MANAGER] Set the channel you wish to recieve Mirror update messages in';
	options: (Option | Subcommand)[] = [
		new Option(
			'channel',
			'The channel you wish to recieve update messages',
			ApplicationCommandOptionType.Channel,
			true
		),
	];
	public requiredPermissions = [PermissionFlagsBits.SendMessages];

	public async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			if (!(interaction.channel instanceof TextChannel)) {
				interaction.reply('Command must be used in a server');
				return;
			}
			let member = interaction.member as GuildMember;
			if (
				!member.permissionsIn(interaction.channel!).has(PermissionFlagsBits.Administrator,) &&
				member.id != config.owner
			) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}
			let channel = interaction.options.getChannel('channel');
			if (!interaction.guild?.members.me) return;

			if (
				!interaction.guild?.members.me?.permissionsIn(channel?.id!).has(PermissionFlagsBits.SendMessages) ||
				!interaction.guild?.members.me?.permissionsIn(channel?.id!).has(PermissionFlagsBits.EmbedLinks)
			) {
				interaction.reply({
					content:
						'Mirror does not have permissions to send messages in the specified channel',
					ephemeral: true,
				});
				return;
			}
			if (channel!.type !== ChannelType.GuildText)
				interaction.reply({
					content: 'Channel must be a text channel',
					ephemeral: true,
				});
			//var enmapChannel = updateChannels.ensure(interaction.guild.id, '');
			updateChannels.set(interaction.guild.id, channel?.id);
			let embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Sucessfully updated your development messages to ${channel} `
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
	guildRequired?: boolean = true;
	managerRequired?: boolean | undefined = true;
}
