//Call: Slash command test
//Returns a greeting reply to the user
import { Bot } from '../Bot';
import { Permissions, CommandInteraction, CacheType } from 'discord.js';
import { Command } from './Command';

export class Test implements Command {
	public commandName = 'test';
	public registerData = {
		name: this.commandName,
		description: 'Replies with your name!',
	};
	public requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES];

	public async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		interaction.reply(`Hello ${interaction.user.username}`);
	}
}
