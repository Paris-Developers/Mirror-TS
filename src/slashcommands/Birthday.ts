
import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
	ApplicationCommandOptionType
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { silencedUsers } from './SilenceMember';
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

const dayCap = {
	january: 31,
	february: 29,
	march: 31,
	april: 30,
	may: 31,
	june: 30,
	july: 31,
	august: 31,
	september: 30,
	october: 31,
	november: 30,
	december: 31,
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
	description: string = 'Set your birthday to receive a birthday message';
	options: (Option | Subcommand)[] = [
		new Subcommand('set', 'set your birthday', [
			new Option(
				'day',
				'The day of your birthday',
				ApplicationCommandOptionType.Integer,
				true
			),
			new Option(
				'month',
				'The month of your birthday',
				ApplicationCommandOptionType.String,
				true,
				undefined,
				months
			),
		]),
		new Subcommand('upcoming', 'view upcoming birthdays')
	];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			if (userArray.includes(interaction.user.id)) {
				return interaction.reply({
					content: 'Silenced users cannot use this command',
					ephemeral: true,
				});
			}

			if (interaction.options.getSubcommand() === 'set') {
				let day = interaction.options.getInteger('day');
				let month = interaction.options.getString('month');

				if (
					day! > dayCap[month!] ||
					day! < 1
				) {
					return interaction.reply({
						content: 'Please enter a valid date',
						ephemeral: true,
					});
				}

				//store the date of birth in numerical form  DD-MM
				let formattedBirthday = `${day} -${monthCode[month!]} `;

				//set the new birthday into the enmap
				bdayDates.set(interaction.user.id, { day: day, month: month });
				let monthCap =
					month!.charAt(0).toUpperCase() +
					month!.slice(1);
				let embed = new EmbedBuilder()
					.setColor(colorCheck(interaction.guild!.id))
					.setDescription(`Successfully set your birthday to ${monthCap} ${day} `);
				return interaction.reply({ embeds: [embed] });
			}
			if (interaction.options.getSubcommand() === 'upcoming') {
				let birthdaysMap = bdayDates; // Use the existing bdayDates Enmap
				let birthdays = Array.from(birthdaysMap.entries()); // [[id, {day, month}]]
				//sort by day and month
				birthdays.sort((a: any, b: any) => {
					let monthA = months.find((m) => m.value === a[1].month);
					let monthB = months.find((m) => m.value === b[1].month);
					if (months.indexOf(monthA!) < months.indexOf(monthB!)) return -1;
					if (months.indexOf(monthA!) > months.indexOf(monthB!)) return 1;
					if (a[1].day < b[1].day) return -1;
					if (a[1].day > b[1].day) return 1;
					return 0;
				});
				let embed = new EmbedBuilder()
					.setTitle('Upcoming Birthdays')
					.setColor(colorCheck(interaction.guild!.id));
				let description = '';
				birthdays.forEach((entry: any) => {
					let user = interaction.guild!.members.cache.get(entry[0]);
					if (user) {
						let monthCap = entry[1].month.charAt(0).toUpperCase() + entry[1].month.slice(1);
						description += `${user.displayName} - ${monthCap} ${entry[1].day} \n`;
					}
				});
				embed.setDescription(description);
				return interaction.reply({ embeds: [embed] });
			}
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error, contact a developer to investigate',
				ephemeral: true,
			});
		}
	}
}

