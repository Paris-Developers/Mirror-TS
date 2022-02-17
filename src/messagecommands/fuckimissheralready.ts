//This fxn will not be going on the documentation
//today got me like....
//god really made me fall in love overnight
//sheesh....
//god damn im so scared
//actually rent free
//got me so depressed im actually doing school work, thats a new low

import { Message, Permissions, MessageEmbed } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';
import fetch from 'node-fetch';

//update? Still in love, I just want to hold her close

export class fuckimissheralready implements MessageCommand {
	name: string = 'fuckimessheralready';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		await message.delete();
		let res = await fetch(`https://nekos.best/api/v1/cry`);
		let jsonData = await res.json();
		let embed = new MessageEmbed()
			.setColor('#0071b6')
			.setImage(jsonData.url)
			.setFooter('I feel you bro');
		message.channel.send({ embeds: [embed] });
	}
}
