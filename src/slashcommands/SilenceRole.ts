import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	Role,
	MessageEmbed,
	Interaction,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { managerRoles } from './ManagerRole';
import { silencedUsers } from './SilenceMember';
import { Option, Subcommand } from './Option';

export const silencedRole = new Enmap('SilencedRole');

export class SilenceRole implements SlashCommand {
	name: string = 'silencerole';
	description: string =
		'[MANAGER] Set a role from using Birthday, Intro, or Music commands.';
	options: (Option | Subcommand)[] = [
		new Option(
			'role',
			'The role to silence',
			ApplicationCommandOptionTypes.ROLE,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			let badRole = interaction.options.getRole('role') as Role;

			if (
				badRole?.permissionsIn(interaction.channel!.id).has('ADMINISTRATOR')
			) {
				return interaction.reply({
					content: 'Roles with administrator permissions cannot be silenced!',
				});
			}
			let managedRoles = managerRoles.ensure(interaction.guild!.id, []);
			for (let role of managedRoles) {
				if (role == badRole?.id) {
					return interaction.reply({
						content: 'Manager Roles cannot be silenced!',
						ephemeral: true,
					});
				}
			}
			let currentRole = silencedRole.get(interaction.guild!.id) as string;
			if (badRole.id == currentRole) {
				silencedRole.delete(interaction.guild!.id);
				return interaction.reply({
					content: `Removed ${badRole} as silenced role`,
				});
			}
			silencedRole.set(interaction.guild!.id, badRole?.id);
			if (currentRole && currentRole != badRole.id) {
				let getRole = interaction.guild?.roles.cache.get(currentRole);
				const embed = new MessageEmbed()
					.setColor('#FFFFFF')
					.setDescription(
						`Replaced role ${getRole} with ${badRole} as silenced role.  Members with this role will not be able to interact with Birthdays, Introthemes or Music Commands.`
					);
				return interaction.reply({ embeds: [embed] });
			}
			const embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setDescription(
					`Set ${badRole} as silenced, members with this role will not be able to react with Birthdays, Introthemes, and Music Commands`
				);
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}

export function silenceCheck(interaction: Interaction): boolean {
	let member = interaction.guild!.members.cache.get(interaction.user.id);
	if (member?.permissions.toArray().includes('ADMINISTRATOR')) return false;
	let silenced = silencedRole.get(interaction.guild!.id);
	if (member?.roles.cache.has(silenced)) return true;
	silenced = silencedUsers.get(interaction.guild!.id);
	for (let user of silenced) {
		if (user == member!.id) return true;
	}
	return false;
}
