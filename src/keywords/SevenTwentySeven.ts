//Keyword: 727
//Reacts to the keyword with WYSI embed

import { Message, Permissions, EmbedBuilder } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class SevenTwentySeven implements Keyword {
	name: string = '727';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
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
			message.channel.send({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
