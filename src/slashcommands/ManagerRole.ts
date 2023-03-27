import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	TextChannel,
	GuildMember,
	Role,
	ApplicationCommandOptionType,
	CommandInteractionOptionResolver,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export const managerRoles = new Enmap('managerRoles');

export class ManagerRole implements SlashCommand {
	name: string = 'managerrole';
	description: string = '[MANAGER] Add or remove a role as a manager';
	options: (Option | Subcommand)[] = [
		new Option(
			'role',
			'The role you want to add or remove as a manager',
			ApplicationCommandOptionType.Role,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		var options = interaction.options as CommandInteractionOptionResolver;
		let role = options.getRole('role') as Role;
		if (role.managed) {
			interaction.reply({
				content:
					'Cannot set externally managed roles, or bot roles as Mirror Managers',
				ephemeral: true,
			});
			return;
		}
		let roleArray = managerRoles.ensure(interaction.guild!.id, []);
		if (roleArray.includes(role.id)) {
			let ptr = roleArray.indexOf(role.id);
			roleArray.splice(ptr);
			managerRoles.set(interaction.guild!.id, roleArray);
			interaction.reply({
				content: `Successfully removed ${role} as a Mirror Manager`,
				ephemeral: true,
			});
			return;
		}

		//I fully expect us to never need this but if someone is just needlessly adding we should stop it
		if (roleArray.length > 15) {
			interaction.reply({
				content:
					'Mirror limits servers to 15 manager roles. Please remove manager roles before adding more. If this is not possible contact a developer for more options',
				ephemeral: true,
			});
			return;
		}
		roleArray.push(role.id);
		managerRoles.set(interaction.guild!.id, roleArray);
		interaction.reply({
			content: `Successfully added ${role} as a Mirror Manager`,
			ephemeral: true,
		});
		return;
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
