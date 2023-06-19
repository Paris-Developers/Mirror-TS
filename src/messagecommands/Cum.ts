//penis pie makes the chicken cry
import { Message, PermissionsBitField } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

import { nsfw } from '../slashcommands/Nsfw';

export class Cum implements MessageCommand {
	name: string = 'cum';
	requiredPermissions: bigint[] = [
		PermissionsBitField.Flags.SendMessages,
		PermissionsBitField.Flags.EmbedLinks,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			if (nsfw.get(message.guild!.id) != 'on') return;
			let rand = Math.round(100 * Math.random());
			if (rand == 69) {
				message.reply('You are the scrumple king');
				return;
			}
			message.channel.send('Absolutely nothing');
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
