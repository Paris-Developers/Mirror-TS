import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Support implements SlashCommand {
	name: string = 'support';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Join Mirrors public support server',
	};
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		interaction.reply('discord.gg/uvdg2R5PAU');
		return;
	}
}
