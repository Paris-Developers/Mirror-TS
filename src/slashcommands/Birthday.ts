import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { birthdayTimer } from '../resources/birthdayTimer';
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
const timezones = [
	{
		name: 'EST',
		value: 'est',
	},
	{
		name: 'CST',
		value: 'cst',
	},
	{
		name: 'MST',
		value: 'mst',
	},
	{
		name: 'PST',
		value: 'pst',
	},
];
type timeIndex = { [index: string]: number };
const timezoneCode = {
	est: 1,
	cst: 0,
	gmt: -1,
	pst: -2,
} as timeIndex;

export let bdayDates = new Enmap({ name: 'bdayDates' });
export let bdayChannels = new Enmap({ name: 'bdayChannels' });
export let bdayTimes = new Enmap({ name: 'bdayTimes' });

export class Birthday implements SlashCommand {
	name: string = 'birthday';
	registerData = {
		name: this.name,
		description:
			'Set your birthday to recieve a Birthday message on your birthday!',
		options: [
			{
				name: 'set',
				description: 'Set your birthday',
				type: 1,
				required: false,
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
			},
			{
				name: 'config',
				description:
					'Allows an admin to configure the time and channel to send the birthday messages',
				type: 1,
				required: false,
				options: [
					{
						name: 'channel',
						description:
							'Set the channel where the birthday messages are sent to',
						required: true,
						type: ApplicationCommandOptionTypes.CHANNEL,
					},
					{
						name: 'hour',
						description:
							'The hour you want to send Birthday messages in local time, military format (0-23)',
						type: 'INTEGER',
						required: true,
					},
					{
						name: 'minute',
						description: 'The minut you want to send Birthday messages',
						type: 'INTEGER',
						required: true,
					},
					{
						name: 'timezone',
						description: 'Your local timezone',
						type: 'STRING',
						required: true,
						choices: timezones,
					},
				],
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		if (interaction.options.getSubcommand() == 'set') {
			//TODO: Permission Check

			//ensure that the enmap has stored the user, and stores their birthday. If not create it and give it an empty string.
			var userBirthday = bdayDates.ensure(`${interaction.user.id}`, '');
			//store the date of birth in numerical form
			let formattedBirthday = `${interaction.options.getInteger('day')}-${
				monthCode[interaction.options.getString('month')!]
			}`;
			//place the updated guild JSON in the enmap
			bdayDates.set(interaction.user.id, formattedBirthday);
			interaction.reply({
				content: `Successfully set your birthday to ${interaction.options.getInteger(
					'day'
				)}-${interaction.options.getString('month')}`,
				ephemeral: false,
			});
			return;
		}
		if (interaction.options.getSubcommand() == 'config') {
			//TODO: Verify user is an admin
			//TODO: Permissions check

			//CHANNEL BLOCK
			var guildChannel = bdayChannels.ensure(interaction.guild!.id, '');
			guildChannel = interaction.options.getChannel('channel');
			bdayChannels.set(interaction.guild!.id, guildChannel.id);
			bdayChannels.forEach((element) => console.log(element));

			let hour = interaction.options.getInteger('hour')!;
			if (hour > 23 || hour < 0)
				return interaction.reply({
					content:
						'Invalid hour, please use military format (0-23) where 0 represents midnight.',
					ephemeral: true,
				});
			let minute = interaction.options.getInteger('minute')!;
			if (minute > 60 || minute < 0)
				return interaction.reply({
					content: 'Invalid minute, please provide an integer between 0 and 60',
					ephemeral: true,
				});
			let timezone = interaction.options.getString('timezone')!;
			let tzChange = timezoneCode[timezone];
			let cst = hour + tzChange;
			let date = 'x';
			if (cst + tzChange >= 24) {
				date = 'plus';
				cst -= 24;
			}
			if (cst + tzChange < 0) {
				date = 'minus';
				cst += 24;
			}
			let infostring = bdayChannels.ensure(interaction.guild!.id, '');
			infostring = `${minute}-${hour}-${date}-${timezone}`;
			bdayTimes.set(interaction.guild!.id, infostring);
			birthdayTimer(interaction.guild!.id, bot);
			interaction.reply({
				content: `Successfully configured your birthday timer to ${hour}:${minute} ${timezone.toUpperCase()} in ${interaction.options.getChannel(
					'channel'
				)}`,
			});
		}
	}
}
/*
		return;
		if (interaction.options.getSubcommand() == 'channel') {
			//TODO: Permission Check
			//TODO: verify user is an admin

			//ensure that the enmap has stored the guild and brings in the JSON. If not create it and give it an empty JSON.
			var guildChannel = bdayChannels.ensure(`${interaction.guild!.id}`, '');
			//store the date of birth in numerical form
			guildChannel = interaction.options.getChannel('channel');
			//place the updated guild JSON in the enmap
			bdayChannels.set(`${interaction.guild!.id}`, guildChannel.id);
			bdayChannels.forEach((element) => console.log(element));
			interaction.reply({
				content: `Successfully set your birthday Channel to ${interaction.options.getChannel(
					'channel'
				)}`,
				ephemeral: false,
			});
			return;
		}
		if (interaction.options.getSubcommand() == 'time') {
			let hour = interaction.options.getInteger('hour')!;
			if (hour > 23 || hour < 0)
				return interaction.reply({
					content:
						'Invalid hour, please use military format (0-23) where 0 represents midnight.',
					ephemeral: true,
				});
			var minute = interaction.options.getInteger('minute')!;
			if (minute > 60 || minute < 0)
				return interaction.reply({
					content: 'Invalid minute, please provide an integer between 0 and 60',
					ephemeral: true,
				});
			var timezone = interaction.options.getString('timezone')!;
			let tzChange = timezoneCode[timezone];
			let cst = hour + tzChange;
			let date = 'x';
			if (cst + tzChange >= 24) {
				date = 'plus';
				cst -= 24;
			}
			if (cst + tzChange < 0) {
				date = 'minus';
				cst += 24;
			}
			let infostring = bdayChannels.ensure(`${interaction.guild!.id}`, '');
			infostring =  //readable splitable string that will be used in creating crons MM-HH-DATEMOD-TIMEZONE
			bdayTimes.set(`${interaction.guild!.id}`, infostring);
			birthdayTimer(`${interaction.guild!.id}`, bot);
			interaction.reply({ content: 'Sucessfully configured your time' });
			return;
		}
		return;
		if (interaction.options.getSubcommand() == 'message') {
			//TODO: Permission Check
		}
		if (interaction.options.getSubcommand() == 'time') {
			//TODO, handle errors, this may have to be done in every sub command
		}
	}
}
*/
