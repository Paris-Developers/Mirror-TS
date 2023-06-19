import { CommandInteraction, CacheType } from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class DestroyQueue implements SlashCommand {
	name: string = 'destroyqueue';
	description: string = 'Empty and destroy the queue, will reset the music player entirely';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			let queue = bot.player.getQueue(interaction.guild!.id);
			if (queue) {
				queue.destroy();
			}
			interaction.reply('Reset the queue');
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
