import {
	CommandInteraction,
	CommandInteractionOptionResolver,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
	ApplicationCommandDataResolvable,
	ApplicationCommandStringOption,
	APIApplicationCommandInteractionDataIntegerOption,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option } from './Option';
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
	description =
		'Set your birthday to recieve a special message on your birthday!';
	options = [
		new Option(
			'month',
			'Your Birth Month',
			ApplicationCommandOptionType.STRING,
			true,
			'may',
			months
		),
		new Option(
			'day',
			'The date of your birthday',
			ApplicationCommandOptionType.IN,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			if (userArray.includes(interaction.user.id)) {
				interaction.reply({
					content: 'Silenced users cannot use this command',
					ephemeral: true,
				});
				return;
			}

			if (
				interaction.options.getInteger('day')! >
					dayCap[interaction.options.getString('month')!] ||
				interaction.options.getInteger('day')! < 1
			) {
				interaction.reply({
					content: 'Please enter a valid date',
					ephemeral: true,
				});
				return;
			}

			//store the date of birth in numerical form  DD-MM
			let formattedBirthday = `${interaction.options.getInteger('day')}-${
				monthCode[interaction.options.getString('month')!]
			}`;
			

			//set the new birthday into the enmap
			bdayDates.set(interaction.user.id, formattedBirthday);
			let monthCap =
				interaction.options.getString('month')!.charAt(0).toUpperCase() +
				interaction.options.getString('month')!.slice(1);
			let embed = new EmbedBuilder()
				.setDescription(
					`Successfully set your birthday to: ${monthCap} ${interaction.options.getInteger(
						'day'
					)}`
				)
				.setColor(colorCheck(interaction.guild!.id));
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
}
