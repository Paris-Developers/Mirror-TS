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
import { managerCheck } from '../resources/managerCheck';

export class RemoveIntro implements SlashCommand {
	public name = 'removeintro';
	public registerData = {
		name: this.name,
		description: '[MANAGER] Delete someones intro theme!',
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
		try {
			let badUser = interaction.options.getUser('user');
			const promiseMeAnUnlink = promisify(unlink);

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
					content: `${interaction.options.getUser(
						'user'
					)} does not have an intro.`,
					ephemeral: true,
				});
				return;
			} else {
				bot.logger.error(interaction.channel!.id, this.name, err);
				interaction.reply({
					content: 'Error detected, contact an admin for further details.',
					ephemeral: true,
				});
				return;
			}
		}
	}
	guildRequired?: boolean = true;
	managerRequired?: boolean | undefined = true;
}
