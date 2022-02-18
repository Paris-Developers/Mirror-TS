//Keyword: Mirror emoji
//Reacts to the Mirror Emoji with the Mirror Emoji

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class MirrorEmoji implements Keyword {
	name: String = '🪞';
	requiredPermissions: bigint[] = [Permissions.FLAGS.ADD_REACTIONS];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		message.react('🪞');
	}
}
