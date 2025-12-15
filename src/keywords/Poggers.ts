//Keyword: poggers
//Reacts to the keyword with JamesChamp

import { Message, PermissionFlagsBits } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Poggers implements Keyword {
	name: string = 'poggers';
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.AddReactions,
		PermissionFlagsBits.UseExternalEmojis,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: String[]
	): Promise<void> {
		// This check was likely intended to be here, not in requiredPermissions
		if (message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
		try {
			const num = (Math.random())
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
