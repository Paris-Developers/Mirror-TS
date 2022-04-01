//Call: Slash command kanye
//Returns a random kanye quote
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	MessageEmbed,
	Permissions,
} from 'discord.js';
import fetch from 'node-fetch';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';

export class Kanye implements SlashCommand {
	name: string = 'kanye';
	description: string = 'Kanye';
	options = [];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let res = await fetch(`https://api.kanye.rest/`);
			let jsonData = await res.json();
			const embed = new MessageEmbed()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(`**${jsonData.quote}**`)
				.setFooter({
					text: 'Kanye West',
					iconURL: 'https://imgur.com/olrP4cN.jpeg',
				});
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
