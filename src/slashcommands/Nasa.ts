//Call: Slash command nasa
//Returns the Nasa Image of the Day and corresponding description
import {
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import config from '../resources/config';
import { Option, Subcommand } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';

export class Nasa implements SlashCommand {
	name: string = 'nasa';
	description: string = 'NASA\'s astronomy picture of the day';
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
			await interaction.deferReply(); // this command can take a while to respond, so we need to defer the reply.
			let res = await fetch(
				`https://api.nasa.gov/planetary/apod?api_key=${config.nasa_token}`
			);
			let jsonData = await res.json();
			let footer = `${jsonData.date} NASA Astronomy Picture of the day`; //we need this for the deprecation error we are getting with .setFooter()
			var embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(`${jsonData.explanation.substr(0, 200)}...`)
				.setFooter({ text: footer })
				.setImage(jsonData.url)
				.setTitle(`**${jsonData.title}**`)
				.setURL('https://apod.nasa.gov/apod/astropix.html');
			if (jsonData.copyright) embed.setAuthor({ name: jsonData.copyright }); //checks to see if the copyright item exists, then it will include it in the author slot.
			await interaction.editReply({ embeds: [embed] }); //technically deferReply() creates the reply, so we need to edit that.
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			//the reply was already deferred above, so reply() would throw and leave them on "thinking"
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
}
