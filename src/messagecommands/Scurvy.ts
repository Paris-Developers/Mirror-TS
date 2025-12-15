
//Hidden command $scurvy, pretty lit

import {
	Message,
	PermissionFlagsBits,
	EmbedBuilder
} from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Scurvy implements MessageCommand {
	name: string = 'scurvy';
	requiredPermissions: bigint[] = [PermissionFlagsBits.ManageMessages];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			if (message.channel && 'send' in message.channel) {
				(message.channel as any).send({
					content:
						'https://cdn.discordapp.com/attachments/851259021424689163/871810578586320967/scurvy.png',
				});
			} return;
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
