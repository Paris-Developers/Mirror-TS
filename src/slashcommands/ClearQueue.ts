import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class ClearQueue implements SlashCommand {
	name: string = 'clearqueue';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Clear the music queue.',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing) return interaction.reply('There is no queue');
		queue.clear();
		return interaction.reply('Queue has been successfully cleared');
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
