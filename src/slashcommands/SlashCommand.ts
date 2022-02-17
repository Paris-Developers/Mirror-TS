//All slash commands derive from this interface
import { Bot } from '../Bot';
import { CommandInteraction, ApplicationCommandData } from 'discord.js';

export interface SlashCommand {
	name: string;
	registerData: ApplicationCommandData;
	requiredPermissions: Array<bigint>;
	run(bot: Bot, interaction: CommandInteraction): Promise<void>;
}
