import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	PermissionsBitField,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Support implements SlashCommand {
	name: string = 'support';
	description: string = 'Join Mirrors public support server';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		PermissionsBitField.Flags.SendMessages,
		PermissionsBitField.Flags.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			interaction.reply('discord.gg/uvdg2R5PAU');
			return;
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
