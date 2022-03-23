//Keyword: keywordtest
//Replys to the keyword with the users name
import { Message } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class KeywordTest implements Keyword {
	name = 'keywordtest';
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			message.reply(`Hello keyword user: ${message.author.username}`);
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
