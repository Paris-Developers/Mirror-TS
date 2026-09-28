//Checks an array of specified permissions for a messages channel, returns a boolean
//this version is for NON slash commands

import { Message, TextChannel } from 'discord.js';
import { Bot } from '../Bot';

//PermissionFlagsBits properties are all bigints, thus we take an array of them for permissionsToCheck
export async function msgPermsCheck(
	bot: Bot,
	message: Message,
	permissionsToCheck: Array<bigint>
): Promise<boolean> {
	//outside a server there are no server permissions to check
	if (!message.inGuild() || permissionsToCheck.length == 0) return true;
	if (!(message.channel instanceof TextChannel)) return true; //we only need to care about permissions in guild text channels
	//Mirror's own member is kept in the cache, so this only asks Discord if something has gone badly wrong
	let guildMember = message.guild.members.me ?? (await message.guild.members.fetchMe());
	let permissions = message.channel.permissionsFor(guildMember);
	for (let permission of permissionsToCheck) {
		if (!permissions.has(permission)) return false;
	}
	return true;
}
