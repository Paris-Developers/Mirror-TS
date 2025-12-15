
//penis pie makes the chicken cry
import {
	Message, PermissionFlagsBits,
	EmbedBuilder
} from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

import { nsfw } from '../slashcommands/Nsfw';

export class Cum implements MessageCommand {
	name: string = 'cum';
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			if (nsfw.get(message.guild!.id) != 'on') return;
			let rand = Math.round(100 * Math.random());
			if (rand == 69) {
				message.reply('You are the scrumple king');
				return;
			}
			const embed = new EmbedBuilder()
				.setImage('https://cdn.discordapp.com/attachments/851259021424689163/871810578586320967/scurvy.png') // generic placeholder
				.setColor('#FFFFFF');
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
