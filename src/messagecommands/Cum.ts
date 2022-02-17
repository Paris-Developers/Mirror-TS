//penis pie makes the chicken cry
import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Cum implements MessageCommand {
	name: string = 'cum';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		let rand = Math.round(100 * Math.random());
		if (rand == 69) {
			message.reply('You are the scrumple king');
			return;
		}
		message.channel.send('Absolutely nothing');
	}
}
