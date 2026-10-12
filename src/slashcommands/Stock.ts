//Call: Slash command stock
//Says that stock data is unavailable: the provider it was built on is gone

import {
	ChatInputCommandInteraction,
	CacheType,
	ApplicationCommandOptionType,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option, Subcommand } from './Option';
import { respond } from '../resources/respond';

export class Stock implements SlashCommand {
	name: string = 'stock';
	description: string = 'Stock ticker data (currently unavailable)';
	options: (Option | Subcommand)[] = [
		new Option(
			'tickers',
			'tickers to query, space separated',
			ApplicationCommandOptionType.String,
			true
		),
	];
	//nothing is fetched or embedded any more, so this needs no permission in the channel
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		//IEX Cloud, the only provider this ever called, shut down in August 2024, so every lookup was
		//failing with "contact a developer" as though Mirror were at fault. To bring the command back:
		//choose a provider, put its key in config, and rebuild the embed from the version in git
		//history (it needs SendMessages and EmbedLinks in requiredPermissions again, and guildRequired,
		//since the embed colour comes from the server's setting)
		await respond(
			interaction,
			'Stock lookups are unavailable: the data provider Mirror used shut down, and no replacement has been set up. A developer has to connect a new one.'
		);
	}
}
