import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Warn implements Keyword {
	name: String = '!warn';
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		message.reply(
			'https://tenor.com/view/discord-meme-spooked-scared-mod-gif-18361254'
		);
		return;
	}
}
