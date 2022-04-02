//Call: Slash command stock or s
//Returns 1-10 specified stocks in embed form

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	Permissions,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import config from '../../config.json';
import fetch from 'node-fetch';
import { Option, Subcommand } from './Option';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { colorCheck } from '../resources/embedColorCheck';

export class Stock implements SlashCommand {
	name: string = 'stock';
	description: string = 'Stock ticker data';
	options: (Option | Subcommand)[] = [
		new Option(
			'tickers',
			'tickers to query, space separated',
			ApplicationCommandOptionTypes.STRING,
			true
		),
	];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			//tests to see if the command was passed in with arguements
			if (!interaction.options.getString('tickers')) {
				const embed = new MessageEmbed()
					.setColor(colorCheck(interaction.guild!.id))
					.setDescription('Please provide a valid ticker(s)');
				interaction.reply({ embeds: [embed] });
				return;
			}
			//splits the entry text into separate arguements
			let args = interaction.options.getString('tickers')!.split(' ');
			if (args.length > 10) {
				const embed = new MessageEmbed()
					.setColor(colorCheck(interaction.guild!.id))
					.setDescription('Please provide 10 or fewer stocks to call');
				interaction.reply({ embeds: [embed] });
				return;
			}
			//trys the code as normal but if it encounters an error it will run the code under the catch function
			const embedList = [];
			let ctr = 0;
			for (let ticker of args) {
				//Pulls ticker data from the API and stores it as a JSON object
				let res = await fetch(
					`https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=${config.stock_token}`
				);
				let jsonData = await res.json();

				//define company name and ticker symbol
				ticker = ticker.toUpperCase();
				let company = jsonData.companyName;

				//defines latest price, change, and sets the sign to the matching emoji.
				let curPrice = jsonData.latestPrice;
				let change = jsonData.change;
				let changePercent = jsonData.changePercent;
				let sign = [':arrow_down_small:', ''];
				if (change > 0) {
					sign = [':arrow_up_small:', '+'];
				} else if (change == 0) {
					sign = [':left_right_arrow:', ''];
				}

				//defines previous day close
				let yesterday = jsonData.previousClose;

				//defines daily high and low prices
				let high24 = `$${jsonData.high}`;
				let low24 = `$${jsonData.low}`;
				if (high24 == `$${null}`) {
					//sets values to 'N/A' in the case of the API not updating for the day
					high24 = 'N/A';
					low24 = 'N/A';
				}

				//defines 52 week high and low trading prices
				let high52 = jsonData.week52High;
				let low52 = jsonData.week52Low;

				//creates discord message embed and edits the modifiers with the attained variables above
				embedList[ctr] = new MessageEmbed()
					.setColor(colorCheck(interaction.guild!.id))
					.setTitle(`__Summary for ${company}:__`)
					.setDescription(' ')
					.addFields(
						{
							name: ticker,
							value: `${sign[0]} $${curPrice}(${sign[1]}${change})\n**Previous Close:** $${yesterday}`,
						},
						{
							name: `:bar_chart: Daily Range:    `,
							value: `:chart_with_upwards_trend: ${high24}\n:chart_with_downwards_trend: ${low24}`,
							inline: true,
						},
						{
							name: `:bar_chart: 52 Week Range:    `,
							value: `:chart_with_upwards_trend: $${high52}\n:chart_with_downwards_trend: $${low52}`,
							inline: true,
						},
						{
							name: `:notepad_spiral: Info:`,
							value: `Currency: ${jsonData.currency}\nPrimary Exchange: ${jsonData.primaryExchange}`,
							inline: true,
						}
					)
					.setTimestamp();
				ctr += 1;
			}
			//sends embed array to the channel
			interaction.reply({ embeds: embedList });
			return;
		} catch (err) {
			if (err instanceof Object) {
				const test = Object.getOwnPropertyDescriptor(err, 'type');
				if (test?.value == 'invalid-json') {
					interaction.reply({
						content: 'Invalid ticker symbol.',
						ephemeral: true,
					});
					return;
				}
			}
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
}
