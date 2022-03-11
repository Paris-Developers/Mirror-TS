//keyword: fortbush emoji;
//Reacts to the fortbush with a fortbush :D

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Fortbush implements Keyword {
	name: string = '<:fortbush:816549663812485151>';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.ADD_REACTIONS,
		Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			message.react(':FortBush:816549663812485151');
		} catch (err) {
			bot.logger.error(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
