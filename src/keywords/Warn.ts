import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Warn implements Keyword {
	name: string = '!warn';
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			message.reply(
				'https://tenor.com/view/discord-meme-spooked-scared-mod-gif-18361254'
			);
			return;
		} catch (err) {
			bot.logger.error(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
