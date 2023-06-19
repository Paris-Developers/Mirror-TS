//keyword: fortbush emoji;
//Reacts to the fortbush with a fortbush :D

import { Message, PermissionsBitField } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from './Keyword';

export class Fortbush implements Keyword {
	name: string = '<:fortbush:816549663812485151>';
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
			message.react(':FortBush:956572430711808090');
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
