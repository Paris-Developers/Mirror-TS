import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option } from './Option';
import { respond } from '../resources/respond';

const choices = [
	{
		name: 'On',
		value: 'on',
	},
	{
		name: 'Off',
		value: 'off',
	},
];

export let nsfw = new Enmap({ name: 'nsfw' });

export class Nsfw implements SlashCommand {
	name: string = 'nsfw';
	description: string =
		'[MANAGER] Check your current NSFW setting, or toggle it ON or OFF';
	options = [
		new Option(
			'toggle',
			'Switch your servers NSFW status to ON or OFF',
			ApplicationCommandOptionType.String,
			false,
			'off',
			choices
		),
	];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			//who may use this is settled by managerRequired, as it is for every other [MANAGER] command
			var setting = nsfw.ensure(interaction.guild!.id, 'off');
			const embed = new EmbedBuilder();
			if (interaction.options.getString('toggle') == 'on') {
				nsfw.set(interaction.guild!.id, 'on');
				embed.setDescription('NSFW has been toggled `ON`');
				interaction.reply({ embeds: [embed] });
				return;
			}
			if (interaction.options.getString('toggle') == 'off') {
				nsfw.set(interaction.guild!.id, 'off');
				embed.setDescription('NSFW has been toggled `OFF`');
				interaction.reply({ embeds: [embed] });
				return;
			}
			embed.setDescription(
				`Your NSFW settings are currently set to \`${setting.toUpperCase()}\``
			);
			interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
