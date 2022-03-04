//Call: Slash command banintro
//Removes a selected users intro
import {
	CommandInteraction,
	CacheType,
	GuildMember,
	TextChannel,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { unlink } from 'fs';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { promisify } from 'util';

export class BanIntro implements SlashCommand {
	public name = 'removeintro';
	public registerData = {
		name: this.name,
		description: '[ADMIN ONLY] Delete someones intro theme!',
		options: [
			{
				name: 'user',
				description: 'Member to remove intro',
				type: 6,
				required: true,
			},
		],
	};
	public requiredPermissions = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		let member = interaction.member as GuildMember;
		if (!(interaction.channel instanceof TextChannel)) {
			interaction.reply('Command must be used in a server');
			return;
		}
		if (!member.permissionsIn(interaction.channel!).has('ADMINISTRATOR')) {
			interaction.reply({
				content:
					'This command is only for people with Administrator permissions',
				ephemeral: true,
			});
			return;
		}
		let badUser = interaction.options.getUser('user');
		const promiseMeAnUnlink = promisify(unlink);
		try {
			await promiseMeAnUnlink(
				`./data/intros/${interaction.guild!.id}/${badUser!.id}.mp4`
			);
			await interaction.reply({
				content: 'Intro successfully deleted',
				ephemeral: true,
			});
		} catch (err: any) {
			if (err.code == 'ENOENT') {
				interaction.reply({
					content: `${badUser} does not have an intro.`,
					ephemeral: true,
				});
				return;
			} else {
				bot.logger.error(interaction.channel.id, this.name, err);
				interaction.reply({
					content: 'Error detected, contact an admin for further details.',
					ephemeral: true,
				});
				return;
			}
		}
	}
	guildRequired?: boolean = true;
}
