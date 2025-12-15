import {
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Support implements SlashCommand {
	name: string = 'support';
	description: string = 'Join Mirrors public support server';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			interaction.reply('discord.gg/uvdg2R5PAU');
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			const embed = new EmbedBuilder()
				.setColor('Red')
				.setDescription('Error: contact a developer to investigate');
			interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
			return;
		}
	}
}

