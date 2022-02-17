//All slash commands derive from this interface
import { Bot } from '../Bot';
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
} from 'discord.js';

export interface SlashCommand {
	name: string;
	registerData: ChatInputApplicationCommandData;
	requiredPermissions: Array<bigint>;
	run(bot: Bot, interaction: CommandInteraction): Promise<void>;
}
