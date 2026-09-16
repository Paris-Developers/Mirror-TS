import {
	ApplicationCommandDataResolvable,
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	GuildMember,
	MessageFlags,
	ApplicationCommandOptionType,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { QueueRepeatMode } from 'discord-player';

export class Skip implements SlashCommand {
	name: string = 'skip';
	description = 'Skip the current song in the queue';
	options = [
		new Option(
			'number',
			'How many tracks you want to skip in the queue',
			ApplicationCommandOptionType.Integer,
			false
		)
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.nodes.get(interaction.guild!.id);
			if (!queue || !queue.isPlaying()) {
				embed.setDescription('There is no music playing!');
				return void interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
			}
			if(queue.repeatMode){
				queue.setRepeatMode(QueueRepeatMode.OFF);
			}
			let tracksToSkip = interaction.options.getInteger('number');
			if (tracksToSkip) {
				if (tracksToSkip > 15) tracksToSkip = 15;
				if (tracksToSkip > queue.tracks.size) {
					tracksToSkip = queue.tracks.size;
				}
				queue.node.skipTo(tracksToSkip - 1);
				embed.setDescription(
					`${tracksToSkip} tracks skipped by ${interaction.user}`
				);
				return void interaction.reply({ embeds: [embed] });
			} else {
				queue.node.skip();
				embed.setDescription(`Track skipped by ${interaction.user}`);
				return void interaction.reply({ embeds: [embed] });
			}
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
