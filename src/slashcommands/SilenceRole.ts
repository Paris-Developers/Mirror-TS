import {
	ChatInputCommandInteraction,
	CacheType,
	Role,
	EmbedBuilder,
	GuildMember,
	Interaction,
	MessageFlags,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { managerRoles } from './ManagerRole';
import { silencedUsers } from './SilenceMember';
import { Option, Subcommand } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';

export const silencedRole = new Enmap({ name: 'SilencedRole' });

export class SilenceRole implements SlashCommand {
	name: string = 'silencerole';
	description: string =
		'[MANAGER] Silence a role from using Intro, Music, or Birthday commands';
	options: (Option | Subcommand)[] = [
		new Option(
			'role',
			'The role to silence',
			ApplicationCommandOptionType.Role,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			let badRole = interaction.options.getRole('role') as Role;

			if (
				badRole?.permissionsIn(interaction.channel!.id).has(PermissionFlagsBits.Administrator)
			) {
				return void interaction.reply({
					content: 'Roles with administrator permissions cannot be silenced!',
				});
			}
			let managedRoles = managerRoles.ensure(interaction.guild!.id, []);
			for (let role of managedRoles) {
				if (role == badRole?.id) {
					return void interaction.reply({
						content: 'Manager Roles cannot be silenced!',
						flags: MessageFlags.Ephemeral,
					});
				}
			}
			let currentRole = silencedRole.get(interaction.guild!.id) as string;
			if (badRole.id == currentRole) {
				silencedRole.delete(interaction.guild!.id);
				return void interaction.reply({
					content: `Removed ${badRole} as silenced role`,
				});
			}
			silencedRole.set(interaction.guild!.id, badRole?.id);
			if (currentRole && currentRole != badRole.id) {
				let getRole = interaction.guild?.roles.cache.get(currentRole);
				const embed = new EmbedBuilder()
					.setColor(colorCheck(interaction.guild!.id))
					.setDescription(
						`Replaced role ${getRole} with ${badRole} as silenced role.  Members with this role will not be able to interact with Birthdays, Introthemes or Music Commands.`
					);
				return void interaction.reply({ embeds: [embed] });
			}
			const embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Set ${badRole} as silenced, members with this role will not be able to react with Birthdays, Introthemes, and Music Commands`
				);
			return void interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}

//the same question asked two ways: a command has an interaction, while things that run on their own,
//such as the birthday timer, only ever have a member
export function silenceCheck(member: GuildMember): boolean;
export function silenceCheck(interaction: Interaction): boolean;
export function silenceCheck(target: GuildMember | Interaction): boolean {
	if (!(target instanceof GuildMember)) {
		//the person who used the command may not be in the member cache, and the silenced list is kept
		//by user id, so that half of the rule still applies without one
		let member = target.guild!.members.cache.get(target.user.id);
		return member
			? silenceCheck(member)
			: silencedMembers(target.guild!.id).includes(target.user.id);
	}
	if (target.permissions.has(PermissionFlagsBits.Administrator)) return false;
	let silenced = silencedRole.get(target.guild.id) as string;
	if (silenced && target.roles.cache.has(silenced)) return true;
	return silencedMembers(target.guild.id).includes(target.id);
}

function silencedMembers(guildId: string): string[] {
	return (silencedUsers.get(guildId) as string[]) ?? [];
}
