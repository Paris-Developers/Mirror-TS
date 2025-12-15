
import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	GuildMember,
	TextChannel,
	GuildChannel,
	PermissionResolvable
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export const silencedUsers = new Enmap({ name: 'silencedUsers' });

export class SilenceMember implements SlashCommand {
	name: string = 'silencemember';
	description: string =
		'[ADMIN ONLY] Silence a member from using Intros, Music or Birthday commands.';
	options: (Option | Subcommand)[] = [
		new Option(
			'user',
			'The user to silence/unsilence',
			ApplicationCommandOptionType.User,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			let badUser = interaction.options.getUser('user');
			if (badUser?.bot) {
				const embed = new EmbedBuilder()
					.setColor('Red')
					.setDescription('Bots cannot be silenced');
				return interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			}
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			//if the user is already silenced, we want to unsilence them
			if (userArray.includes(badUser!.id)) {
				let ptr = userArray.indexOf(badUser!.id);
				userArray.splice(ptr, 1);
				silencedUsers.set(interaction.guild!.id, userArray);
				return interaction.reply({
					content: `Successfully unsilenced ${badUser} `,
					ephemeral: true,
				});
			}

			let badMember = interaction.guild!.members.cache.get(badUser!.id); //need to pull member object for .permissionsIn()
			if (
				badMember!.permissionsIn(interaction.channel!.id).has(PermissionFlagsBits.Administrator)
			) {
				return interaction.reply({
					content: 'Administrators cannot be silenced',
					ephemeral: true,
				});
			}

			if (userArray.length > 100) {
				return interaction.reply({
					content:
						'Servers are limited to 100 members silenced. Please unsilence somemembers before silencing more.  If this is not possible please contact a developeer for more options',
					ephemeral: true,
				});
			}
			userArray.push(badUser?.id);
			silencedUsers.set(interaction.guild!.id, userArray);
			return interaction.reply({
				content: `Successfully silenced ${badUser} `,
				ephemeral: true,
			});
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
