import { CommandInteraction, TextChannel } from 'discord.js';
import { Bot } from '../Bot';
import { EventHandler } from './EventHandler';

export class InteractionCreate implements EventHandler {
	eventName = 'interactionCreate';

	async process(bot: Bot, interaction: CommandInteraction) {
		if (!interaction.isCommand()) return;

		if (!bot.commands.has(interaction.commandName)) return;

		let command = bot.commands.get(interaction.commandName);

		//if the command requires permissions
		if (command.requiredPermissions) {
			if (
				!(await bot.permissionsCheck(
					bot,
					interaction,
					command.requiredPermissions
				))
			) {
				// We don't have all the permissions we need. Log and return.
				if (!(interaction.channel instanceof TextChannel)) {
					bot.logger.error(
						`Somehow permissionsCheck returned false in a non-textchannel. Offending command: ${command.commandName}`
					);
				} else {
					bot.logger.warn(
						`Missing permissions to use ${
							command.commandName
						} in channel: ${interaction.channel!.name}, in ${
							interaction.guild!.name
						}`
					);
				}
				return;
			}
		}
		command.run(bot, interaction);
	}
}