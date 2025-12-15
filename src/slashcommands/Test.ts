//Call: Slash command test
//Returns a greeting reply to the user
import { Bot } from '../Bot';
import { PermissionFlagsBits, ChatInputCommandInteraction, CacheType } from 'discord.js';
import { SlashCommand } from './SlashCommand';
import { Option, Subcommand } from './Option';

export class Test implements SlashCommand {
	public name = 'test';
	description: string = 'Replies with your name!';
	options: (Option | Subcommand)[] = [];
	public requiredPermissions = [PermissionFlagsBits.SendMessages];

	public async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			interaction.reply(`Hello ${interaction.user.username}`);
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
}
