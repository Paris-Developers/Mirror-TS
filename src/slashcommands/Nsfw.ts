import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	ChatInputApplicationCommandData,
	Permissions,
	EmbedBuilder,
	GuildMember,
	GuildChannel,
	TextChannel,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option } from './Option';

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
			ApplicationCommandOptionTypes.STRING,
			false,
			'off',
			choices
		),
	];
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			if (!(interaction.channel instanceof TextChannel)) {
				interaction.reply('Command must be used in a server');
				return;
			}
			if (!member.permissionsIn(interaction.channel!).has('ADMINISTRATOR')) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}
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
