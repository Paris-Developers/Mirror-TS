import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	EmbedBuilder,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';

export class ClearQueue implements SlashCommand {
	name: string = 'clearqueue';
	description = 'Clear the music queue';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription(
					'There are no songs in the queue or the player is not playing'
				);
				interaction.reply({ embeds: [embed], ephemeral: true });
				return;
			}
			queue.clear();
			embed.setDescription(`Queue has been cleared by ${interaction.user}`);
			interaction.reply({ embeds: [embed] });
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
