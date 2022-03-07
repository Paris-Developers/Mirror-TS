import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	GuildMember,
	TextChannel,
	GuildChannel,
	MessageEmbed,
	ApplicationCommandDataResolvable,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

type monthIndex = { [index: string]: number };
const monthCode = {
	january: 1,
	february: 2,
	march: 3,
	april: 4,
	may: 5,
	june: 6,
	july: 7,
	august: 8,
	september: 9,
	october: 10,
	november: 11,
	december: 12,
} as monthIndex;
const months = [
	{
		name: 'January',
		value: 'january',
	},
	{
		name: 'February',
		value: 'february',
	},
	{
		name: 'March',
		value: 'march',
	},
	{
		name: 'April',
		value: 'april',
	},
	{
		name: 'May',
		value: 'may',
	},
	{
		name: 'June',
		value: 'june',
	},
	{
		name: 'July',
		value: 'july',
	},
	{
		name: 'August',
		value: 'august',
	},
	{
		name: 'September',
		value: 'september',
	},
	{
		name: 'October',
		value: 'october',
	},
	{
		name: 'November',
		value: 'november',
	},
	{
		name: 'December',
		value: 'december',
	},
];

export let bdayDates = new Enmap({ name: 'bdayDates' });

export class Birthday implements SlashCommand {
	name: string = 'birthday';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description:
			'Set your birthday to recieve a Birthday message on your birthday!',
		options: [
			{
				name: 'month',
				description: 'Your birth month',
				type: ApplicationCommandOptionTypes.STRING,
				required: true,
				choices: months,
			},
			{
				name: 'day',
				description: 'The date of your birthday',
				type: ApplicationCommandOptionTypes.INTEGER,
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		//store the date of birth in numerical form  DD-MM
		let formattedBirthday = `${interaction.options.getInteger('day')}-${
			monthCode[interaction.options.getString('month')!]
		}`;

		//set the new birthday into the enmap
		bdayDates.set(interaction.user.id, formattedBirthday);
		let monthCap =
			interaction.options.getString('month')!.charAt(0).toUpperCase() +
			interaction.options.getString('month')!.slice(1);
		let embed = new MessageEmbed()
			.setDescription(
				`Successfully set your birthday to: ${monthCap} ${interaction.options.getInteger(
					'day'
				)}`
			)
			.setColor('#FFFFFF');
		interaction.reply({ embeds: [embed] });
		return;
	}
}
