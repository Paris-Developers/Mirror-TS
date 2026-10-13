//Call: Slash command removeintro
//Removes a selected users intro
import {
	ChatInputCommandInteraction,
	CacheType,
	MessageFlags,
	ApplicationCommandOptionType,
} from 'discord.js';
import { unlink } from 'fs';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { promisify } from 'util';
import { Option, Subcommand } from './Option';
import { respond } from '../resources/respond';

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
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let badUser = interaction.options.getUser('user');
			const promiseMeAnUnlink = promisify(unlink);

			await promiseMeAnUnlink(
				`./data/intros/${interaction.guild!.id}/${badUser!.id}.mp4`
			);
			await interaction.reply({
				content: 'Intro successfully deleted',
				flags: MessageFlags.Ephemeral,
			});
		} catch (err: any) {
			if (err.code == 'ENOENT') {
				interaction.reply({
					content: `${interaction.options.getUser(
						'user'
					)} does not have an intro.`,
					flags: MessageFlags.Ephemeral,
				});
				return;
			} else {
				bot.logger.commandError(interaction.channelId, this.name, err);
				await respond(interaction, 'Error: contact a developer to investigate');
				return;
			}
		}
	}
	guildRequired?: boolean = true;
	managerRequired?: boolean | undefined = true;
}
