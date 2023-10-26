//Checks an array of specified permissions for a messages channel, returns a boolean
//this version is for NON slash commands

import { Client, Message, TextChannel, GuildMember } from 'discord.js';
import { Bot } from '../Bot';

//PermissionsBitField.Flags properties are all bigints, thus we take an array of them for permissionsToCheck
export async function msgPermsCheck(
	bot: Bot,
	message: Message,
	permissionsToCheck: Array<bigint>
): Promise<boolean> {
	let guildMember: GuildMember = await message.guild!.members.fetch(
		bot.client.user!
	);
	if (!(message.channel instanceof TextChannel)) return true; //we only need to care about permissions in guild text channels
	let permissions = message.channel.permissionsFor(guildMember);
	for (let permission of permissionsToCheck) {
		if (!permissions.has(permission)) return false;
	}
	return true;
}
