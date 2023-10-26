//Call: Slash command banintro
//Removes a selected users intro
import {
	CommandInteraction,
	CacheType,
	GuildMember,
	TextChannel,
	ApplicationCommandOptionType,
} from 'discord.js';
import { unlink } from 'fs';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { promisify } from 'util';
import { Option, Subcommand } from './Option';

export class RemoveIntro implements SlashCommand {
	public name = 'removeintro';
	description: string = '[MANAGER] Remove someones intro theme!';
	options: (Option | Subcommand)[] = [
		new Option(
			'user',
			'Member to remove intro',
			ApplicationCommandOptionType.User,
			true
		),
	];
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
				bot.logger.commandError(interaction.channel!.id, this.name, err);
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
