//another one off the books
//man....
//what could have been

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class whydidntitalktoher implements Keyword {
	name: string = 'whydidntitalktoher';
	requiredPermissions: bigint[] = [Permissions.FLAGS.ADD_REACTIONS];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			message
				.react('🇲')
				.then(() => message.react('🇦'))
				.then(() => message.react('🇳'));
		} catch (err) {
			bot.logger.error(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
