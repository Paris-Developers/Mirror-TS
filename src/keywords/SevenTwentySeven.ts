//Keyword: 727
//Reacts to the keyword with WYSI embed

import { Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
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
			let embed = new EmbedBuilder()
				.setColor('#ff66aa')
				.setImage('https://c.tenor.com/zbPLwrk_K44AAAAC/wysi.gif')
				.setTitle('**__WHEN YOU FUCKING SEE IT__**');
			if (message.channel.isSendable()) await message.channel.send({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(message.channelId, this.name, err);
			//the keyword message is usually deleted by now, and Discord refuses a reply to a deleted
			//message unless it's allowed to send it as a plain message instead
			await message
				.reply({
					content: 'Error: contact a developer to investigate',
					failIfNotExists: false,
				})
				.catch((error) => bot.logger.warn(`Could not report the ${this.name} error:`, error));
			return;
		}
	}
}
