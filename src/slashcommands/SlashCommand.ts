//All slash commands derive from this interface
import { Bot } from '../Bot';
import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
} from 'discord.js';

export interface SlashCommand {
	//name of the slash command as discord will register it. Must be all lowercase.
	name: string;
	registerData: ApplicationCommandDataResolvable;
	//an array of Permissions.FLAGS
	requiredPermissions: Array<bigint>;
	//function that will run on command execution
	run(bot: Bot, interaction: CommandInteraction): Promise<void>;
	//if the command needs to be run inside a guild
	guildRequired?: boolean;
}
