import {
	ApplicationCommandDataResolvable,
	ChatInputCommandInteraction,
	CacheType,
	Guild,
	GuildMember,
	TextChannel,
	MessageFlags,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
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
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			let badUser = interaction.options.getUser('user');
			if (badUser?.bot) {
				return void interaction.reply({
					content: 'Bots cannot be silenced',
					flags: MessageFlags.Ephemeral,
				});
			}
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			//if the user is already silenced, we want to unsilence them
			if (userArray.includes(badUser!.id)) {
				let ptr = userArray.indexOf(badUser!.id);
				userArray.splice(ptr);
				silencedUsers.set(interaction.guild!.id, userArray);
				return void interaction.reply({
					content: `Successfully unsilenced ${badUser}`,
					flags: MessageFlags.Ephemeral,
				});
			}

			let badMember = interaction.guild!.members.cache.get(badUser!.id); //need to pull member object for .permissionsIn()
			if (
				badMember!.permissionsIn(interaction.channel!.id).has(PermissionFlagsBits.Administrator)
			) {
				return void interaction.reply({
					content: 'Administrators cannot be silenced',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (userArray.length > 100) {
				return void interaction.reply({
					content:
						'Servers are limited to 100 members silenced. Please unsilence somemembers before silencing more.  If this is not possible please contact a developeer for more options',
					flags: MessageFlags.Ephemeral,
				});
			}
			userArray.push(badUser?.id);
			silencedUsers.set(interaction.guild!.id, userArray);
			return void interaction.reply({
				content: `Successfully silenced ${badUser}`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return void interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
