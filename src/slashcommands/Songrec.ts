//Call $songrec
//Recommends a song and sets the user and songlink into the Enmap songRecs
//Unfinished

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Songrec implements SlashCommand {
	name: string = 'songrec';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Set your song recommendation',
		options: [
			{
				name: 'song',
				type: 'STRING',
				description: 'Song to recommend',
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<boolean> {
		const embed = new MessageEmbed();
		try {
			bot.logger.debug('Hey');
			bot.logger.debug(interaction.user.id);
			bot.songRecs.set(
				interaction.user.id,
				interaction.options.getString('song')
			);
			bot.logger.debug('past songRecs.set');
			let mes = bot.songRecs.get(interaction.user.id);
			bot.logger.debug('past the songRecs.get');
			embed.setDescription(mes);
			await interaction.reply({ embeds: [embed] });
			return true;
		} catch (err) {
			embed.setDescription(`Error: ${err}`);
			bot.logger.error(err);
			await interaction.reply({ embeds: [embed] });
			return false;
		}
	}
}
