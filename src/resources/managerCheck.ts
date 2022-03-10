import { Guild, User, Permissions } from 'discord.js';
import { managerRoles } from '../slashcommands/ManagerRole';

export async function managerCheck(guild: Guild, user: User): Promise<boolean> {
	let member = guild.members.cache.get(user.id);
	if (member?.permissions.toArray().includes('ADMINISTRATOR')) return true;
	let roleArray = managerRoles.ensure(guild.id, []);
	for (let role of roleArray) {
		console.log(role);
		if (member?.roles.cache.has(role)) {
			return true;
		}
	}
	return false;
}
