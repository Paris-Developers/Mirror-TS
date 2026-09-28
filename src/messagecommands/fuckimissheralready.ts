//This fxn will not be going on the documentation
//today got me like....
//god really made me fall in love overnight
//sheesh....
//god damn im so scared
//actually rent free
//got me so depressed im actually doing school work, thats a new low

import { Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';
import { nsfw } from '../slashcommands/Nsfw';

//update? Still in love, I just want to hold her close

export class fuckimissheralready implements MessageCommand {
	name: string = 'fuckimissheralready';
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			await message.delete();
			if (nsfw.get(message.guild!.id) != 'on') return;
			let res = await fetch(`https://nekos.best/api/v1/cry`);
			let jsonData = await res.json();
			let embed = new EmbedBuilder()
				.setColor('#0071b6')
				.setImage(jsonData.url)
				.setFooter({ text: 'I feel you bro' });
			if (message.channel.isSendable()) await message.channel.send({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(message.channelId, this.name, err);
			//the command message is usually deleted by now, and Discord refuses a reply to a deleted
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
