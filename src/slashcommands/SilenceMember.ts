import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	Guild,
	GuildMember,
	TextChannel,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export const silencedUsers = new Enmap('silencedUsers');

export class SilenceMember implements SlashCommand {
	name: string = 'silencemember';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description:
			'[ADMIN ONLY] Silence a member from using Intros or Setting their birthday.',
		options: [
			{
				name: 'user',
				description: 'The user to silence/unsilence',
				required: true,
				type: ApplicationCommandOptionTypes.USER,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		let member = interaction.member as GuildMember;
		if (!(interaction.channel instanceof TextChannel)) {
			return interaction.reply('Command must be used in a server');
		}
		if (!member.permissionsIn(interaction.channel).has('ADMINISTRATOR')) {
			return interaction.reply({
				content:
					'This command is only for people with Administrator permissions',
				ephemeral: true,
			});
		}
		let badUser = interaction.options.getUser('user');
		if (badUser?.bot) {
			return interaction.reply({
				content: 'Bots cannot be silenced',
				ephemeral: true,
			});
		}
		let userArray = silencedUsers.ensure(interaction.guild!.id, []);

		//if the user is already silenced, we want to unsilence them
		if (userArray.includes(badUser!.id)) {
			let ptr = userArray.indexOf(badUser!.id);
			userArray.splice(ptr);
			silencedUsers.set(interaction.guild!.id, userArray);
			return interaction.reply({
				content: `Successfully unsilenced ${badUser}`,
				ephemeral: true,
			});
		}

		let badMember = interaction.guild!.members.cache.get(badUser!.id); //need to pull member object for .permissionsIn()
		if (badMember!.permissionsIn(interaction.channel).has('ADMINISTRATOR')) {
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
			content: `Successfully silenced ${badUser}`,
			ephemeral: true,
		});
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}