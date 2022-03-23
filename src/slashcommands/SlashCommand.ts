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
	//if the command needs to be run by a manager or admin
	managerRequired?: boolean;
	//if the command blocks silenced users/roles set true
	blockSilenced?: boolean;
}
