//Call: Slash command test
//Returns a greeting reply to the user
import { Bot } from '../Bot';
import { CommandInteraction, ApplicationCommandData } from 'discord.js';

export interface Command {
	commandName: string;
	registerData: ApplicationCommandData;
	requiredPermissions: Array<bigint>;
	run(bot: Bot, interaction: CommandInteraction): Promise<void>;
}
