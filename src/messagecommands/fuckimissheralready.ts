//This fxn will not be going on the documentation
//today got me like....
//god really made me fall in love overnight
//sheesh....
//god damn im so scared
//actually rent free
//got me so depressed im actually doing school work, thats a new low

import {
	Message, PermissionFlagsBits,
	EmbedBuilder
} from 'discord.js';
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
			const embed = new EmbedBuilder()
				.setColor('#0071b6')
				.setImage(jsonData.url)
				.setFooter({ text: 'I feel you bro' });
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
