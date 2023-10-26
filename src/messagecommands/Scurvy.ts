//Hidden command $scurvy, pretty lit

import { Message, PermissionsBitField } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Scurvy implements MessageCommand {
	name: string = 'scurvy';
	requiredPermissions: bigint[] = [
		PermissionsBitField.Flags.SendMessages,
		PermissionsBitField.Flags.EmbedLinks,
		PermissionsBitField.Flags.ManageMessages,

	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			await message.delete();
			message.channel.send(
				'https://cdn.discordapp.com/attachments/888079059249147984/941073475362234368/scurvy.jpg'
			);
			return;
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
