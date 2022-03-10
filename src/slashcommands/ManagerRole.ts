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
import { SlashCommand } from './SlashCommand';

export const managerRoles = new Enmap('managerRoles');

export class ManagerRole implements SlashCommand {
	name: string = 'managerrole';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: '[ADMIN ONLY] Add or remove a role as a manager',
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
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		//check if the user is an administrator
		if (!(interaction.channel instanceof TextChannel)) {
			return interaction.reply({
				content: 'Command must be used in a server',
				ephemeral: true,
			});
		}
		let member = interaction.member as GuildMember;
		if (!member.permissionsIn(interaction.channel).has('ADMINISTRATOR')) {
			return interaction.reply({
				content:
					'This command is only for people with Administrator permissions',
				ephemeral: true,
			});
		}
		let role = interaction.options.getRole('role') as Role;
		let roleArray = managerRoles.ensure(interaction.guild!.id, []);
		if (roleArray.includes(role.id)) {
			let ptr = roleArray.indexOf(role.id);
			roleArray.splice(ptr);
			managerRoles.set(interaction.guild!.id, roleArray);
			return interaction.reply({
				content: `Successfully removed ${role} as a Mirror Manager`,
			});
		}
		roleArray.push(role.id);
		managerRoles.set(interaction.guild!.id, roleArray);
		return interaction.reply({
			content: `Successfully added ${role} as a Mirror Manager`,
		});
	}
	guildRequired?: boolean | undefined = true;
}
