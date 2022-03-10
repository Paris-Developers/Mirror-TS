import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { player } from '../index';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Shuffle implements SlashCommand {
	name: string = 'shuffle';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Shuffle the music queue',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue) return interaction.reply('There is no queue');
		queue.shuffle();
		return interaction.reply('queue might have been shuffled');
	}
	guildRequired?: boolean | undefined = true;
}
