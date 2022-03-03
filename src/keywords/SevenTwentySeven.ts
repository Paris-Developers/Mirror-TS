//Keyword: pog
//Reacts to the keyword with JamesChamp

import { Message, Permissions, MessageEmbed } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class SevenTwentySeven implements Keyword {
	name: String = '727';
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
		await message.delete();
		let embed = new MessageEmbed()
			.setColor('#ff66aa')
			.setImage('https://c.tenor.com/zbPLwrk_K44AAAAC/wysi.gif')
			.setTitle('**__WHEN YOU FUCKING SEE IT__**');
		message.channel.send({ embeds: [embed] });
	}
}
