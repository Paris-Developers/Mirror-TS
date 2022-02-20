import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	Permissions,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class EndMe implements SlashCommand {
	name: string = 'endme';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'How gavin feels doing this',
	};

	public requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES];
	
    public async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		interaction.reply(`Gavin is being held captive in mirrorDev`);
	}
}





    
