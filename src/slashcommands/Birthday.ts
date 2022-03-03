import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	GuildMember,
	TextChannel,
	GuildChannel,
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
					'[ADMIN ONLY] Configure the time and channel to send the birthday messages',
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
			//store the date of birth in numerical form  DD-MM
			let formattedBirthday = `${interaction.options.getInteger('day')}-${
				monthCode[interaction.options.getString('month')!]
			}`;

			//set the new birthday into the enmap
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
			//If the command is used in a DM, return
			if (!(interaction.channel instanceof TextChannel)) {
				interaction.reply('Command must be used in a server');
				return;
			}

			//set the interaction member object so we can refer to their permissions
			let member = interaction.member as GuildMember;

			//check if the user is an administrator
			if (!member.permissionsIn(interaction.channel!).has('ADMINISTRATOR')) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}

			//recieve the provided channel and check if its a text channel
			var guildChannel = interaction.options.getChannel('channel') as GuildChannel;
			if (guildChannel.type != 'GUILD_TEXT') {
				interaction.reply({
					content: 'Please enter a valid text channel',
					ephemeral: true,
				});
				return;
			}

			//set the channel in the enmap
			bdayChannels.set(interaction.guild!.id, guildChannel.id);

			//get the hour and ensure that it is valid
			let hour = interaction.options.getInteger('hour')!;
			if (hour > 23 || hour < 0){
				return interaction.reply({
					content:
						'Invalid hour, please use military format (0-23) where 0 represents midnight.',
					ephemeral: true,
				});
			}
			//get the minute and ensure that it is valid
			let minute = interaction.options.getInteger('minute')!;
			if (minute > 60 || minute < 0){
				return interaction.reply({
					content: 'Invalid minute, please provide an integer between 0 and 60',
					ephemeral: true,
				});
			}

			//get the timezone and modify the time to create parity with CST
			let timezone = interaction.options.getString('timezone')!;
			let tzChange = timezoneCode[timezone];
			let cst = hour + tzChange;

			//if the timezone requires the bot to scan for a different day, store a modifier that will be used in the scheduler
			let date = 'x';
			if (cst + tzChange >= 24) {
				date = 'plus';
				cst -= 24;
			}
			if (cst + tzChange < 0) {
				date = 'minus';
				cst += 24;
			}

			//set the infostring to be set into the scheduler, Format: MM-HH-DATEMOD-TIMEZONE
			let infostring = `${minute}-${hour}-${date}-${timezone}`;
			bdayTimes.set(interaction.guild!.id, infostring); //scheduler enmap
			birthdayTimer(interaction.guild!.id, bot); //scheduler

			//respond and exit
			interaction.reply({
				content: `Successfully configured your birthday timer to ${hour}:${minute} ${timezone.toUpperCase()} in ${interaction.options.getChannel(
					'channel'
				)}`,
			});
			return;
		}
	}
}
