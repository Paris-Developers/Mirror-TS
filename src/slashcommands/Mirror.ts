//Call: slash command Mirror
//returns a dank image

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Mirror implements SlashCommand {
	name: string = 'mirror';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Mirror go brrrr',
	};
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<boolean> {
		await interaction.reply(
			'https://cdn.discordapp.com/attachments/668116812680003597/933108457463230464/IMG_3906.png'
		);
		return true;
	}
}
