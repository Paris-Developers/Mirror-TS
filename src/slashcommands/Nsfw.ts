import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	ChatInputApplicationCommandData,
	Permissions,
	MessageEmbed,
	GuildMember,
	GuildChannel,
	TextChannel,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { managerCheck } from '../resources/managerCheck';
import { SlashCommand } from './SlashCommand';

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
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description:
			'[MANAGER] Check your current NSFW setting, or toggle it ON or OFF',
		options: [
			{
				name: 'toggle',
				description: 'Switch your servers NSFW status to ON or OFF',
				type: ApplicationCommandOptionTypes.STRING,
				required: false,
				choices: choices,
			},
		],
	};
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		//check if the user is a Manager or Admin
		if (!(await managerCheck(interaction.guild!, interaction.user))) {
			return interaction.reply({
				content:
					'This command can only be used by designated managers or admininstrators',
				ephemeral: true,
			});
		}
		var setting = nsfw.ensure(interaction.guild!.id, 'off');
		const embed = new MessageEmbed();
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
	}
	guildRequired?: boolean | undefined = true;
}
