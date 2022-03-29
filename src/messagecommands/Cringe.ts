import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Cringe implements MessageCommand {
	name: string = 'cringe';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			message.reply('🕴️');
			return;
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
