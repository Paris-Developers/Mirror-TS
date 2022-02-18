//All slash commands derive from this interface
import { Bot } from '../Bot';
import {
	ApplicationCommandDataResolvable,
	ChatInputApplicationCommandData,
	CommandInteraction,
} from 'discord.js';

export interface SlashCommand {
	name: string;
	registerData: ApplicationCommandDataResolvable;
	requiredPermissions: Array<bigint>;
	run(bot: Bot, interaction: CommandInteraction): Promise<void>;
}
