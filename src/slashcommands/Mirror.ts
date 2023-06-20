//Call: slash command Mirror
//returns a dank image

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	PermissionsBitField,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Mirror implements SlashCommand {
	name: string = 'mirror';
	description: string = 'Mirror go brrrr';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [PermissionsBitField.Flags.SendMessages];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			interaction.reply(
				'https://cdn.discordapp.com/attachments/668116812680003597/933108457463230464/IMG_3906.png'
			);
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
}
