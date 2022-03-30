//Call: Slash command nasa
//Returns the Nasa Image of the Day and corresponding description
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
import config from '../../config.json';
import { Option, Subcommand } from './Option';

export class Nasa implements SlashCommand {
	name: string = 'nasa';
	description: string = 'Get daily astronomy pictures';
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
			await interaction.deferReply(); // this command can take a while to respond, so we need to defer the reply.
			let res = await fetch(
				`https://api.nasa.gov/planetary/apod?api_key=${config.nasa_token}`
			);
			let jsonData = await res.json();
			let footer = `${jsonData.date} NASA Astronomy Picture of the day`; //we need this for the deprecation error we are getting with .setFooter()
			bot.logger.debug(jsonData); // <- remove eventually;
			var embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setDescription(`${jsonData.explanation.substr(0, 200)}...`)
				.setFooter({ text: footer })
				.setImage(jsonData.url)
				.setTitle(`**${jsonData.title}**`)
				.setURL('https://apod.nasa.gov/apod/astropix.html');
			if (jsonData.copyright) embed.setAuthor({ name: jsonData.copyright }); //checks to see if the copyright item exists, then it will include it in the author slot.
			interaction.editReply({ embeds: [embed] }); //technically deferReply() creates the reply, so we need to edit that.
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
