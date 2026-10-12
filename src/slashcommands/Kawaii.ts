//Call: Slash command Kawaii
//Returns a random anime winking gif
import {
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Kawaii implements SlashCommand {
	name: string = 'kawaii';
	description: string = 'Wink, wink';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			//fetches the nekos.best api
			let res = await fetch(`https://nekos.best/api/v2/wink`);
			let jsonData = await res.json();
			let embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id)).setImage(jsonData.results[0].url);
			await respond(interaction, { embeds: [embed] }, false);
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	//the embed takes the server's color, so there has to be a server to take it from
	guildRequired?: boolean | undefined = true;
}
