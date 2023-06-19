import { Guild, User, Permissions, Interaction } from 'discord.js';
import { managerRoles } from '../slashcommands/ManagerRole';

export async function managerCheck(interaction: Interaction): Promise<boolean> {
	let member = interaction.guild!.members.cache.get(interaction.user.id);
	if (member?.permissions.toArray().includes('Administrator')) return true;
	let roleArray = managerRoles.ensure(interaction.guild!.id, []);
	for (let role of roleArray) {
		if (member?.roles.cache.has(role)) {
			return true;
		}
	}
	return false;
}
