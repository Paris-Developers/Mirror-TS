//Keyword: Mirror emoji
//Reacts to the Mirror Emoji with the Mirror Emoji

import {
	Message, PermissionFlagsBits,
	EmbedBuilder
} from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class MirrorEmoji implements Keyword {
	name: string = '🪞';
	requiredPermissions: bigint[] = [PermissionFlagsBits.AddReactions];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		try {
			message.react('🪞');
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
