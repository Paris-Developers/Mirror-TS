//Checks an array of specified permissions for a slash command's channel
import { Interaction, PermissionFlagsBits } from 'discord.js';
import { Bot } from '../Bot';

//the permissions Mirror is missing in the channel a command was used in, as readable names like "Send Messages".
//Discord sends Mirror's permissions for that channel along with every command, so this asks Discord nothing:
//fetching the server here used to eat into the three seconds a command has to answer, and a slow or failed
//request left people with "The application did not respond"
//PermissionFlagsBits properties are all bigints, thus we take an array of them for permissionsToCheck
export function missingPermissions(
	interaction: Interaction,
	permissionsToCheck: Array<bigint>
): string[] {
	//answering a command is a reply to the command itself, which needs no Send Messages. many commands
	//still list it from before, and in a thread or a voice channel's chat it could refuse them for nothing
	permissionsToCheck = permissionsToCheck.filter((permission) => permission !== PermissionFlagsBits.SendMessages);
	//outside a server there are no server permissions to be missing
	if (!interaction.inGuild() || permissionsToCheck.length == 0) return [];
	//an Administrator role counts as having everything
	return interaction.appPermissions
		.missing(permissionsToCheck)
		.map((name) => name.replace(/([a-z])([A-Z])/g, '$1 $2'));
}

//the yes or no version, for anything that doesn't need to say which permissions are missing
export async function permissionsCheck(
	bot: Bot,
	interaction: Interaction,
	permissionsToCheck: Array<bigint>
): Promise<boolean> {
	return missingPermissions(interaction, permissionsToCheck).length == 0;
}
