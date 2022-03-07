//Call: Slash command info
//Returns prewritten information about mirror and the owners
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	MessageEmbed,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Info implements SlashCommand {
	name: string = 'info';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Info about the bot',
	};
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(bot: Bot, interaction: CommandInteraction): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setColor('#d4af37')
				.setTitle(':mirror: __Mirror__ :mirror:')
				.setThumbnail('https://i.imgur.com/xBXfVeF.png')
				.setTimestamp()
				.setDescription(
					'Discord utility bot created by Ford, Zac, Leo (not really) and Gavin'
				)
				.addField(
					'__Command List:__',
					'$stock [TICKER]: Displays todays trading value and more for specified ticker \n$weather [city]: displays current weather for specified city \n$info: you are here! \n$test: :smile:'
				)
				.setFooter({
					text: 'Created by Fordle#0001',
					iconURL: 'https://i.imgur.com/Cq4Sbwq.jpg?1',
				});

			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.editReply({
				content: 'Error detected, contact an admin to investigate.',
			});
			return;
		}
	}
}
