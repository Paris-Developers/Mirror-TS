import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class ClearQueue implements SlashCommand {
	name: string = 'clearqueue';
	description = 'Clear the music queue';
	options = [];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor('BLUE');

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription(
					'There are no songs in the queue or the player is not playing'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			queue.clear();
			embed.setDescription(`Queue has been cleared by ${interaction.user}`);
			return interaction.reply({ embeds: [embed] });
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
	musicCommand?: boolean | undefined = true;
}
