//Call: Slash command stock
//Shows a summary for each ticker: price, change, the day's range and the 52 week range

import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option, Subcommand } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';
import { configText } from '../resources/config';

//the data comes from Finnhub, which replaced IEX Cloud after it shut down in 2024. the free plan
//allows 60 calls a minute and each ticker costs three, so the old limit of ten tickers would be
//halfway through that in one command
const maxTickers = 5;

type Quote = { c: number; d: number | null; h: number; l: number; pc: number; t: number };
type Profile = { name?: string; currency?: string; exchange?: string };
type Metrics = { metric?: Record<string, number | null> };

export class Stock implements SlashCommand {
	name: string = 'stock';
	description: string = 'Daily summaries for up to 5 provided tickers';
	options: (Option | Subcommand)[] = [
		new Option(
			'tickers',
			'tickers to query, space separated',
			ApplicationCommandOptionType.String,
			true
		),
	];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	//the embed takes its colour from the server's setting
	guildRequired?: boolean | undefined = true;
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const key = configText('stock_token');
			if (!key) {
				return void (await respond(
					interaction,
					'Stock lookups need an API key. A developer has to put a Finnhub key in the bot config as stock_token.'
				));
			}

			const tickers = [
				...new Set(
					interaction.options
						.getString('tickers')!
						.split(/[\s,]+/)
						.filter(Boolean)
						.map((ticker) => ticker.toUpperCase())
				),
			];
			if (!tickers.length) return void (await respond(interaction, 'Please provide a ticker.'));
			if (tickers.length > maxTickers) {
				return void (await respond(
					interaction,
					`Please ask for ${maxTickers} tickers or fewer at a time.`
				));
			}

			//three requests per ticker takes longer than the three seconds Discord waits for a reply
			await interaction.deferReply();

			const embeds = [];
			for (const ticker of tickers) {
				const quote = await ask<Quote>(key, 'quote', ticker);
				//Finnhub answers for a ticker it doesn't know with zeroes and no timestamp
				if (!quote || !quote.t) {
					return void (await respond(interaction, `No stock found for ${ticker}.`));
				}
				const profile = (await ask<Profile>(key, 'stock/profile2', ticker)) ?? {};
				const metrics = (await ask<Metrics>(key, 'stock/metric', ticker, '&metric=all'))?.metric;

				const change = quote.d ?? 0;
				//down, level, up: the arrow and the sign in front of the change
				const [arrow, sign] =
					change > 0
						? [':arrow_up_small:', '+']
						: change < 0
							? [':arrow_down_small:', '']
							: [':left_right_arrow:', ''];
				const high52 = metrics?.['52WeekHigh'];
				const low52 = metrics?.['52WeekLow'];

				embeds.push(
					new EmbedBuilder()
						.setColor(colorCheck(interaction.guild!.id))
						.setTitle(`__Summary for ${profile.name ?? ticker}:__`)
						.addFields(
							{
								name: ticker,
								value: `${arrow} ${money(quote.c)}(${sign}${change.toFixed(2)})\n**Previous Close:** ${money(quote.pc)}`,
							},
							{
								name: ':bar_chart: Daily Range:',
								value: `:chart_with_upwards_trend: ${money(quote.h)}\n:chart_with_downwards_trend: ${money(quote.l)}`,
								inline: true,
							},
							{
								name: ':bar_chart: 52 Week Range:',
								value: `:chart_with_upwards_trend: ${money(high52)}\n:chart_with_downwards_trend: ${money(low52)}`,
								inline: true,
							},
							{
								name: ':notepad_spiral: Info:',
								value: `Currency: ${profile.currency ?? 'unknown'}\nExchange: ${profile.exchange ?? 'unknown'}`,
								inline: true,
							}
						)
						.setTimestamp(quote.t * 1000)
				);
			}
			await interaction.editReply({ embeds });
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
}

//one call to Finnhub. a ticker nobody has heard of still answers 200, so only real trouble
//(a rejected key, the free plan's limit) ends up as nothing
async function ask<T>(key: string, path: string, ticker: string, extra = ''): Promise<T | undefined> {
	const response = await fetch(
		`https://finnhub.io/api/v1/${path}?symbol=${encodeURIComponent(ticker)}${extra}&token=${key}`
	);
	if (!response.ok) {
		throw new Error(
			response.status === 429
				? 'Finnhub is rate limiting Mirror (60 calls a minute on the free plan)'
				: `Finnhub answered ${response.status} for ${path}`
		);
	}
	return (await response.json()) as T;
}

//prices come back as plain numbers, and a missing one shouldn't read as "$undefined"
function money(value: number | null | undefined): string {
	return typeof value === 'number' && value ? `$${value.toFixed(2)}` : 'N/A';
}
