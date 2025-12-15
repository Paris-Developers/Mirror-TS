
//Keyword: 727
//Reacts to the keyword with WYSI embed

import {
	Message, PermissionFlagsBits,
	EmbedBuilder
} from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class SevenTwentySeven implements Keyword {
	name: string = '727';
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.UseExternalEmojis,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			await message.delete();
			const embed = new EmbedBuilder()
				.setImage('https://c.tenor.com/Zb157579F2wAAAAC/wysi-osu.gif')
				.setColor('#ff0033');
			if (message.channel && 'send' in message.channel) {
				(message.channel as any).send({ embeds: [embed] });
			}
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
