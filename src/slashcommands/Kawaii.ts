//Call: Slash command Kawaii
//Returns a random anime winking gif
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	MessageEmbed,
	Permissions,
} from 'discord.js';
import fetch from 'node-fetch';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Kawaii implements SlashCommand {
	name: string = 'kawaii';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Get a cute catgirl',
	};
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
			let res = await fetch(`https://nekos.best/api/v1/wink`);
			let jsonData = await res.json();
			let embed = new MessageEmbed().setColor('#0071b6').setImage(jsonData.url);
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
