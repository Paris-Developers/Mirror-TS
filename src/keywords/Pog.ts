import { PermissionFlagsBits, Message } from 'discord.js';
//Keyword: pog
//Reacts to the keyword with fordpog or JamesChamp

import { Bot } from '../Bot';
import { Keyword } from './Keyword';

//pog, pogchamp and poggers are the same keyword to anyone typing them, so the three share this
//reaction and only differ by the word they answer to
export abstract class PogReaction implements Keyword {
	abstract name: string;
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.AddReactions,
		PermissionFlagsBits.UseExternalEmojis,
	];
	async run(bot: Bot, message: Message<boolean>, args: String[]): Promise<void> {
		try {
			const num = Math.random();
			if (num > 0.5) {
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

export class Pog extends PogReaction {
	name: string = 'pog';
}
