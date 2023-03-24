import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	GuildMember,
	TextChannel,
	GuildChannel,
	EmbedBuilder,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option } from './Option';
import { birthdayTimer } from '../resources/birthdayTimer';
import Enmap from 'enmap';
import { colorCheck } from '../resources/embedColorCheck';

const timezones = [
	{ name: 'GMT', value: 'gmt' },
	{ name: 'CET', value: 'cet' },
	{ name: 'EET', value: 'eet' },
	{ name: 'EST', value: 'est' },
	{ name: 'CST', value: 'cst' },
	{ name: 'MST', value: 'mst' },
	{ name: 'PST', value: 'pst' },
];
type timeIndex = { [index: string]: number };
const timezoneCode = {
	eet: 8,
	cet: 7,
	gmt: 6,
	est: 1,
	cst: 0,
	mst: -1,
	pst: -2,
} as timeIndex;

export let bdayChannels = new Enmap({ name: 'bdayChannels' });
export let bdayTimes = new Enmap({ name: 'bdayTimes' });

export class BirthdayConfig implements SlashCommand {
	name: string = 'birthdayconfig';
	description =
		'[MANAGER] Configure the time and channel for birthday messages';
	options = [
		new Option(
			'channel',
			'Set the channel where the birthday messages are sent to',
			ApplicationCommandOptionTypes.CHANNEL,
			true
		),
		new Option(
			'hour',
			'The hour you want to send Birthday messages in local time, military format (0-23)',
			ApplicationCommandOptionTypes.INTEGER,
			true
		),
		new Option(
			'minute',
			'The minute you want to send Birthday messages',
			ApplicationCommandOptionTypes.INTEGER,
			true
		),
		new Option(
			'timezone',
			'Your local timezone',
			ApplicationCommandOptionTypes.STRING,
			true,
			'cst',
			timezones
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		let member = interaction.member as GuildMember;
		try {
			//check if the user is an administrator
			if (!(interaction.channel instanceof TextChannel)) {
				interaction.reply('Command must be used in a server');
				return;
			}
			if (!member.permissionsIn(interaction.channel).has('ADMINISTRATOR')) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}

			//recieve the provided channel and check if its a text channel
			var guildChannel = interaction.options.getChannel(
				'channel'
			) as GuildChannel;
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
			if (hour > 23 || hour < 0) {
				return interaction.reply({
					content:
						'Invalid hour, please use military format (0-23) where 0 represents midnight.',
					ephemeral: true,
				});
			}
			//get the minute and ensure that it is valid
			let minute = interaction.options.getInteger('minute')!;
			if (minute > 60 || minute < 0) {
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
			let hourText = hour.toString();
			let minuteText = minute.toString();
			if (hour < 10) hourText = '0' + hourText;
			if (minute < 10) minuteText = '0' + minuteText;
			let embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Successfully scheduled your birthday timer for **\`${hourText}:${minuteText}\` \`${timezone.toUpperCase()}\`** in ${interaction.options.getChannel(
						'channel'
					)}`
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
