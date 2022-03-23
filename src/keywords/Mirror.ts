//Keyword: mirror
//Reacts to the keyword with the eyes emoji

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Mirror implements Keyword {
	name: string = 'mirror';
	requiredPermissions: bigint[] = [Permissions.FLAGS.ADD_REACTIONS];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			message.react('👀');
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
