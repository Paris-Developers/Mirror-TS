import {
	ApplicationCommandDataResolvable,
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	GuildMember,
	MessageFlags,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';

export class ClearQueue implements SlashCommand {
	name: string = 'clearqueue';
	description = 'Clear the music queue';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription(
					'There are no songs in the queue or the player is not playing'
				);
				return void interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
			}
			queue.clear();
			embed.setDescription(`Queue has been cleared by ${interaction.user}`);
			return void interaction.reply({ embeds: [embed] });
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
