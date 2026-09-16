import { ChatInputCommandInteraction, CacheType, MessageFlags } from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class DestroyQueue implements SlashCommand {
	name: string = 'destroyqueue';
	description: string = 'Empty and destroy the queue, will reset the music player entirely';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			let queue = bot.player.nodes.get(interaction.guild!.id);
			if (queue) {
				queue.delete();
			}
			return void interaction.reply('Reset the queue');
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return void interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
