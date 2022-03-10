import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Resume implements SlashCommand {
	name: string = 'Resume;';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Pause the music player',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing) return interaction.reply('There is no queue');
		queue.setPaused(false);
		return interaction.reply('Track might have been resumed');
	}
	guildRequired?: boolean | undefined;
	managerRequired?: boolean | undefined;
}
