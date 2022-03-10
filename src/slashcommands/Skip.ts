import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Skip implements SlashCommand {
	name: string = 'skip';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Skip the current song in the queue',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing) return interaction.reply('There is no queue');
		await queue.skip();
		return void interaction.reply('Track might have been skipped');
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
