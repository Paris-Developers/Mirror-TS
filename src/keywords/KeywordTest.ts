//Keyword: keywordtest
//Replys to the keyword with the users name
import { Message } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class KeywordTest implements Keyword {
	name = 'keywordtest';
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		message.reply(`Hello keyword user: ${message.author.username}`);
	}
}
