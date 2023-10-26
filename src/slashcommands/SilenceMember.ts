import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	Guild,
	GuildMember,
	TextChannel,
	ApplicationCommandOptionType,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export const silencedUsers = new Enmap('silencedUsers');

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
	async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			let badUser = interaction.options.getUser('user');
			if (badUser?.bot) {
				interaction.reply({
					content: 'Bots cannot be silenced',
					ephemeral: true,
				});
				return;
			}
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			//if the user is already silenced, we want to unsilence them
			if (userArray.includes(badUser!.id)) {
				let ptr = userArray.indexOf(badUser!.id);
				userArray.splice(ptr);
				silencedUsers.set(interaction.guild!.id, userArray);
				interaction.reply({
					content: `Successfully unsilenced ${badUser}`,
					ephemeral: true,
				});
				return;
			}

			let badMember = interaction.guild!.members.cache.get(badUser!.id); //need to pull member object for .permissionsIn()
			if (
				badMember!.permissionsIn(interaction.channel!.id).has('Administrator')
			) {
				interaction.reply({
					content: 'Administrators cannot be silenced',
					ephemeral: true,
				});
				return;
			}

			if (userArray.length > 100) {
				interaction.reply({
					content:
						'Servers are limited to 100 members silenced. Please unsilence somemembers before silencing more.  If this is not possible please contact a developeer for more options',
					ephemeral: true,
				});
				return;
			}
			userArray.push(badUser?.id);
			silencedUsers.set(interaction.guild!.id, userArray);
			interaction.reply({
				content: `Successfully silenced ${badUser}`,
				ephemeral: true,
			});
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
