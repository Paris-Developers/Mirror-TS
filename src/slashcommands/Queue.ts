import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Queue implements SlashCommand {
	name: string = 'queue';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'View the music queue',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		throw new Error('Method not implemented.');
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
