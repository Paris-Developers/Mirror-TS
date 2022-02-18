//keyword: fortbush emoji;
//Reacts to the fortbush with a fortbush :D

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Fortbush implements Keyword {
	name: String = '<:fortbush:816549663812485151>';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		message.react(':FortBush:816549663812485151');
	}
}
