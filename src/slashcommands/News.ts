//Call: Slash command news or n
//Returns news story from specified topic or just returns the top news story in the US.

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import config from '../../config.json';
import fetch from 'node-fetch';
import { Option, Subcommand } from './Option';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export class News implements SlashCommand {
	name: string = 'news';
	description: string = 'Current news';
	options: (Option | Subcommand)[] = [
		new Option(
			'query',
			'headling to query, space separated',
			ApplicationCommandOptionTypes.STRING,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			//Runs code as normal, sends  catch if an error is recieved
			const embed = new MessageEmbed() //creates embed
				.setColor('#FFFFFF')
				.setTimestamp();
			let res;
			if (!interaction.options.getString('query')) {
				//fetches the API without query
				res = await fetch(
					`https://newsapi.org/v2/top-headlines?country=us&apiKey=${config.news_token}`
				);
				embed.setFooter({ text: 'Top news story in the US right now' });
			} else {
				//when there is a query requested run the block behind
				let query = '';
				for (let arg of interaction.options.getString('query')!.split(' ')) {
					query += `${arg}+`;
				}
				res = await fetch(
					`https://newsapi.org/v2/top-headlines?country-us&q=${query}&apiKey=${config.news_token}`
				);
			}
			//sets data structure for the API pull
			let jsonData = await res.json();
			if (jsonData.totalResults == 0) {
				interaction.reply("Couldn't find any articles with those queries");
				return;
			}
			//specify embed modifications for individual option and sends message
			embed.setTitle(jsonData.articles[0].title);
			embed.setURL(jsonData.articles[0].url);
			embed.setDescription(jsonData.articles[0].description);
			embed.setThumbnail(jsonData.articles[0].urlToImage);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
}
