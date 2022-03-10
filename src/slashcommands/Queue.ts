import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { player } from '..';
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
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing) return interaction.reply('There is no queue');
		let trackString = '';
		let ptr = 1;
		for (let track of queue.tracks) {
			trackString =
				trackString +
				`${ptr}) \`${track.title}\`,\`${track.author}\` (${track.duration})\n`;
			ptr++;
			if (ptr == 35) break;
		}
		return interaction.reply(trackString);
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
