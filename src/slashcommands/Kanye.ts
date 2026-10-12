//Call: Slash command kanye
//Returns a random kanye quote
import {
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';
import { SlashCommand } from './SlashCommand';

export class Kanye implements SlashCommand {
	name: string = 'kanye';
	description: string = 'Kanye';
	options = [];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let res = await fetch(`https://api.kanye.rest/`);
			let jsonData = await res.json();
			const embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(`**${jsonData.quote}**`)
				.setFooter({
					text: 'Kanye West',
					iconURL: 'https://imgur.com/olrP4cN.jpeg',
				});
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
