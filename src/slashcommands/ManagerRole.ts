import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	TextChannel,
	GuildMember,
	Role,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { managerCheck } from '../resources/managerCheck';
import { SlashCommand } from './SlashCommand';

export const managerRoles = new Enmap('managerRoles');

export class ManagerRole implements SlashCommand {
	name: string = 'managerrole';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: '[MANAGER] Add or remove a role as a manager',
		options: [
			{
				name: 'role',
				description: 'The role you want to add or remove as a manager',
				type: ApplicationCommandOptionTypes.ROLE,
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		//check if the user is a Manager or Admin
		if (!(await managerCheck(interaction.guild!, interaction.user))) {
			return interaction.reply({
				content:
					'This command can only be used by designated managers or admininstrators',
				ephemeral: true,
			});
		}
		let role = interaction.options.getRole('role') as Role;
		if (role.managed) {
			return interaction.reply({
				content:
					'Cannot set externally managed roles, or bot roles as Mirror Managers',
				ephemeral: true,
			});
		}
		let roleArray = managerRoles.ensure(interaction.guild!.id, []);
		if (roleArray.includes(role.id)) {
			let ptr = roleArray.indexOf(role.id);
			roleArray.splice(ptr);
			managerRoles.set(interaction.guild!.id, roleArray);
			return interaction.reply({
				content: `Successfully removed ${role} as a Mirror Manager`,
				ephemeral: true,
			});
		}

		//I fully expect us to never need this but if someone is just needlessly adding we should stop it
		if (roleArray.length > 15) {
			return interaction.reply({
				content:
					'Mirror limits servers to 15 manager roles. Please remove manager roles before adding more. If this is not possible contact a developer for more options',
				ephemeral: true,
			});
		}
		roleArray.push(role.id);
		managerRoles.set(interaction.guild!.id, roleArray);
		return interaction.reply({
			content: `Successfully added ${role} as a Mirror Manager`,
			ephemeral: true,
		});
	}
	guildRequired?: boolean | undefined = true;
}
