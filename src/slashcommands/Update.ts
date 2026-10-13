import { Bot } from '../Bot';
import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	MessageFlags,
	ChannelType,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import { SlashCommand } from './SlashCommand';
import Enmap from 'enmap';
import { Option, Subcommand } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';

export let updateChannels = new Enmap({ name: 'updateChannels' });

export class Update implements SlashCommand {
	public name = 'update';
	description: string =
		'[MANAGER] Set the channel you wish to receive Mirror update messages in';
	options: (Option | Subcommand)[] = [
		new Option(
			'channel',
			'The channel you wish to receive update messages',
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
			//who may use this is settled by managerRequired, as it is for every other [MANAGER] command
			let channel = interaction.options.getChannel('channel');
			if (
				!interaction.guild?.members.me
					?.permissionsIn(channel?.id!)
					.has(PermissionFlagsBits.SendMessages) ||
				!interaction.guild?.members.me?.permissionsIn(channel?.id!).has(PermissionFlagsBits.EmbedLinks)
			) {
				interaction.reply({
					content:
						'Mirror does not have permissions to send messages in the specified channel',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			if (channel!.type !== ChannelType.GuildText)
				return void interaction.reply({
					content: 'Channel must be a text channel',
					flags: MessageFlags.Ephemeral,
				});
			updateChannels.set(interaction.guild!.id, channel?.id);
			let embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Successfully updated your development messages to ${channel}`
				);
			await interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean = true;
	managerRequired?: boolean | undefined = true;
}
