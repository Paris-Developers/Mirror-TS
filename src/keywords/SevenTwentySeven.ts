//Keyword: 727
//Reacts to the keyword with WYSI embed

import { Message, PermissionsBitField, EmbedBuilder } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class SevenTwentySeven implements Keyword {
	name: string = '727';
	requiredPermissions: bigint[] = [
		PermissionsBitField.Flags.ManageMessages,
		PermissionsBitField.Flags.UseExternalEmojis,
		PermissionsBitField.Flags.SendMessages,
		PermissionsBitField.Flags.EmbedLinks,
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
