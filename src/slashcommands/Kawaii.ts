//Call: Slash command Kawaii
//Returns a random anime winking gif
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	EmbedBuilder,
	Permissions,
} from 'discord.js';
import fetch from 'node-fetch';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Kawaii implements SlashCommand {
	name: string = 'kawaii';
	description: string = 'Wink, wink';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			//fetches the nekos.best api
			let res = await fetch(`https://nekos.best/api/v2/wink`);
			let jsonData = await res.json();
			let embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id)).setImage(jsonData.results[0].url);
			interaction.reply({ embeds: [embed] });
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
