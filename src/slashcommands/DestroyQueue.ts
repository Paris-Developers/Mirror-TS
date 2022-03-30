import { CommandInteraction, CacheType } from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { player } from '..';

export class DestroyQueue implements SlashCommand {
	name: string = 'destroyqueue';
	description: string = 'Empty and destroy the queue';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			let queue = player.getQueue(interaction.guild!.id);
			if (queue) {
				queue.destroy();
			}
			return interaction.reply('Reset the queue');
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
}