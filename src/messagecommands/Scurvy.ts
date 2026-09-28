import { PermissionFlagsBits, Message } from 'discord.js';
//Hidden command $scurvy, pretty lit

import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Scurvy implements MessageCommand {
	name: string = 'scurvy';
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
		PermissionFlagsBits.ManageMessages,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			await message.delete();
			if (message.channel.isSendable()) await message.channel.send(
				'https://cdn.discordapp.com/attachments/888079059249147984/941073475362234368/scurvy.jpg'
			);
			return;
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
