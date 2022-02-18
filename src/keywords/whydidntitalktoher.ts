//another one off the books
//man....
//what could have been

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class whydidntitalktoher implements Keyword {
	name: String = 'whydidntitalktoher';
	requiredPermissions: bigint[] = [Permissions.FLAGS.ADD_REACTIONS];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		message
			.react('🇲')
			.then(() => message.react('🇦'))
			.then(() => message.react('🇳'));
	}
}
