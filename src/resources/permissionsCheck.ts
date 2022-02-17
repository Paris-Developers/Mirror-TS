//Checks an array of specified permissions for a messages channel, returns a boolean
import { Interaction, TextChannel } from 'discord.js';
import { Bot } from '../Bot';

//Permissions.FLAGS properties are all bigints, thus we take an array of them for permissionsToCheck
export async function permissionsCheck(
	bot: Bot,
	interaction: Interaction,
	permissionsToCheck: Array<bigint>
): Promise<boolean> {
	if (!interaction.guild) return true;
	await interaction.guild.fetch();
	if (!(interaction.channel instanceof TextChannel)) return true; //we only need to care about permissions in guild text channels
	let guildMember = await interaction.guild.members.fetch(bot.client.user!);
	let permissions = interaction.channel.permissionsFor(guildMember);
	for (let permission of permissionsToCheck) {
		if (!permissions.has(permission)) return false;
	}
	return true;
}
