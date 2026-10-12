import {
	ChatInputCommandInteraction,
	CacheType,
	GuildChannel,
	EmbedBuilder,
	ChannelType,
	ApplicationCommandOptionType,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option } from './Option';
import { birthdayTimer } from '../resources/birthdayTimer';
import Enmap from 'enmap';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';

const timezones = [
	{ name: 'GMT', value: 'gmt' },
	{ name: 'CET', value: 'cet' },
	{ name: 'EET', value: 'eet' },
	{ name: 'EST', value: 'est' },
	{ name: 'CST', value: 'cst' },
	{ name: 'MST', value: 'mst' },
	{ name: 'PST', value: 'pst' },
];
//node-cron schedules against an IANA zone, not an abbreviation, so each choice maps to the region
//that normally keeps that time. A region rather than a fixed offset means a birthday set for 8:00
//is still sent at 8:00 once daylight saving moves
const ianaZones: { [index: string]: string } = {
	gmt: 'Europe/London',
	cet: 'Europe/Paris',
	eet: 'Europe/Athens',
	est: 'America/New_York',
	cst: 'America/Chicago',
	mst: 'America/Denver',
	pst: 'America/Los_Angeles',
};

export let bdayChannels = new Enmap({ name: 'bdayChannels' });
export let bdayTimes = new Enmap({ name: 'bdayTimes' });

export type BirthdayTime = { minute: number; hour: number; timezone: string };

export function cronTimezone(timezone: string): string {
	return ianaZones[timezone];
}

//the stored time, saved as MM-HH-TIMEZONE. Older servers saved MM-HH-DATEMOD-TIMEZONE, where the
//date modifier stood in for the timezone the cron job never got; node-cron handles the timezone
//itself now, so the modifier is dropped on read and the rest is read as it always was
export function birthdayTime(guild: string): BirthdayTime | undefined {
	const parts = String(bdayTimes.get(guild) ?? '').split('-');
	const minute = Number(parts[0]);
	const hour = Number(parts[1]);
	const timezone = parts.length > 3 ? parts[3] : parts[2];
	if (!validTime(minute, hour) || !ianaZones[timezone]) return undefined;
	return { minute, hour, timezone };
}

function validTime(minute: number, hour: number): boolean {
	return (
		Number.isInteger(minute) &&
		Number.isInteger(hour) &&
		minute >= 0 &&
		minute <= 59 &&
		hour >= 0 &&
		hour <= 23
	);
}

export class BirthdayConfig implements SlashCommand {
	name: string = 'birthdayconfig';
	description =
		'[MANAGER] Configure the time and channel for birthday messages';
	options = [
		new Option(
			'channel',
			'Set the channel where the birthday messages are sent to',
			ApplicationCommandOptionType.Channel,
			true
		),
		new Option(
			'hour',
			'The hour you want to send Birthday messages in local time, military format (0-23)',
			ApplicationCommandOptionType.Integer,
			true
		),
		new Option(
			'minute',
			'The minute you want to send Birthday messages',
			ApplicationCommandOptionType.Integer,
			true
		),
		new Option(
			'timezone',
			'Your local timezone',
			ApplicationCommandOptionType.String,
			true,
			'cst',
			timezones
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			//receive the provided channel and check if its a text channel
			var guildChannel = interaction.options.getChannel(
				'channel'
			) as GuildChannel;
			if (guildChannel.type !== ChannelType.GuildText) {
				await respond(interaction, 'Please enter a valid text channel');
				return;
			}

			//get the hour and ensure that it is valid
			let hour = interaction.options.getInteger('hour')!;
			if (hour > 23 || hour < 0) {
				return void (await respond(
					interaction,
					'Invalid hour, please use military format (0-23) where 0 represents midnight.'
				));
			}
			//get the minute and ensure that it is valid. 60 used to be accepted, and node-cron then
			//threw on a minute that doesn't exist
			let minute = interaction.options.getInteger('minute')!;
			if (minute > 59 || minute < 0) {
				return void (await respond(
					interaction,
					'Invalid minute, please provide an integer between 0 and 59'
				));
			}
			let timezone = interaction.options.getString('timezone')!;

			//nothing is saved until the job is running: the scheduler reads these back, so a time it
			//refuses would otherwise leave the server saved but unscheduled
			const previousChannel = bdayChannels.get(interaction.guild!.id);
			const previousTime = bdayTimes.get(interaction.guild!.id);
			bdayChannels.set(interaction.guild!.id, guildChannel.id);
			bdayTimes.set(interaction.guild!.id, `${minute}-${hour}-${timezone}`);
			if (!(await birthdayTimer(interaction.guild!.id, bot))) {
				restore(interaction.guild!.id, previousChannel, previousTime);
				await respond(interaction, 'Error: contact a developer to investigate');
				return;
			}

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
			await respond(interaction, { embeds: [embed] }, false);
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}

function restore(guild: string, channel: unknown, time: unknown): void {
	if (channel) bdayChannels.set(guild, channel);
	else bdayChannels.delete(guild);
	if (time) bdayTimes.set(guild, time);
	else bdayTimes.delete(guild);
}
