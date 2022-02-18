//Keyword: pog
//Reacts to the keyword with JamesChamp

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Pog implements Keyword {
	name: String = 'pog';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		message.react(':JamesChamp:791190997236842506');
	}
}
