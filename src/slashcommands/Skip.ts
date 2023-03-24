import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	EmbedBuilder,
	GuildMember,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { Queue, QueueRepeatMode } from 'discord-player';

export class Skip implements SlashCommand {
	name: string = 'skip';
	description = 'Skip the current song in the queue';
	options = [
		new Option(
			'number',
			'How many tracks you want to skip in the queue',
			ApplicationCommandOptionTypes.INTEGER,
			false
		)
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription('There is no music playing!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			if(queue.repeatMode){
				queue.setRepeatMode(QueueRepeatMode.OFF);
			}
			let tracksToSkip = interaction.options.getInteger('number');
			if (tracksToSkip) {
				if (tracksToSkip > 15) tracksToSkip = 15;
				if (tracksToSkip > queue.tracks.length) {
					tracksToSkip = queue.tracks.length;
				}
				await queue.skipTo(tracksToSkip - 1);
				embed.setDescription(
					`${tracksToSkip} tracks skipped by ${interaction.user}`
				);
				return interaction.reply({ embeds: [embed] });
			} else {
				await queue.skip();
				embed.setDescription(`Track skipped by ${interaction.user}`);
				return interaction.reply({ embeds: [embed] });
			}
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
