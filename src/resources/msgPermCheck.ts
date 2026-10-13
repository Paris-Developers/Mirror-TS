//Checks an array of specified permissions for a messages channel, returns a boolean
//this version is for NON slash commands

import { Message, PermissionFlagsBits } from 'discord.js';

//PermissionFlagsBits properties are all bigints, thus we take an array of them for permissionsToCheck
export async function msgPermsCheck(
	message: Message,
	permissionsToCheck: Array<bigint>
): Promise<boolean> {
	//outside a server there are no server permissions to check
	if (!message.inGuild() || permissionsToCheck.length == 0) return true;
	//Mirror's own member is kept in the cache, so this only asks Discord if something has gone badly wrong
	let guildMember = message.guild.members.me ?? (await message.guild.members.fetchMe());
	//a thread carries its parent channel's permissions, except that posting in one is its own
	//permission. checking Send Messages there would pass while Mirror still can't answer
	if (message.channel.isThread()) {
		permissionsToCheck = permissionsToCheck.map((permission) =>
			permission === PermissionFlagsBits.SendMessages
				? PermissionFlagsBits.SendMessagesInThreads
				: permission
		);
	}
	let permissions = message.channel.permissionsFor(guildMember);
	//a thread reads its permissions off its parent channel, and returns nothing at all when that
	//parent isn't cached. the types don't admit it, and calling .has on nothing would throw inside
	//the message handler. unknown is not the same as refused, so the command gets to try
	if (!permissions) return true;
	for (let permission of permissionsToCheck) {
		if (!permissions.has(permission)) return false;
	}
	return true;
}
