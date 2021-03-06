//Keyword: poggers
//Reacts to the keyword with JamesChamp

import { Message, Permissions } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Poggers implements Keyword {
	name: string = 'poggers';
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
			const num =(Math.random())
			if (num > .5) {
				message.react('<:fordpog:972224310951428176>');
				return;
			}
			message.react(':JamesChamp:956572430778912858');
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
