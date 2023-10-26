//Keyword: pogchamp
//Reacts to the keyword with JamesChamp

import { Message, PermissionsBitField } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class PogChamp implements Keyword {
	name: string = 'pogchamp';
	requiredPermissions: bigint[] = [
		PermissionsBitField.Flags.AddReactions,
		PermissionsBitField.Flags.UseExternalEmojis,
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
