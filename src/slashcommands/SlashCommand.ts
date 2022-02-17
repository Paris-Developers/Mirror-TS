//All slash commands derive from this interface
import { Bot } from '../Bot';
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface SlashCommand {
	name: string;
	registerData: ChatInputApplicationCommandData;
	requiredPermissions: Array<bigint>;
	run(bot: Bot, interaction: CommandInteraction): Promise<void>;
}
