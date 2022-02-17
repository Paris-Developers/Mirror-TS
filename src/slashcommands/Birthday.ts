import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

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
				name: 'channel',
				description: 'Set the channel where the birthday messages are sent to',
				type: ApplicationCommandOptionTypes.CHANNEL,
				required: false,
			},
			{
				name: 'message',
				description: 'Edit the message used when its someones birthday',
				type: ApplicationCommandOptionTypes.STRING,
				required: false,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		//No global permission check because different functions are doing different things
		interaction.reply('placeholder');
		return;
	}
}
