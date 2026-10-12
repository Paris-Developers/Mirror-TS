import { QueueRepeatMode } from 'discord-player';
import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Loop implements SlashCommand {
	name: string = 'loop';
	description: string = 'Loop the song that is currently playing';
	options: (Option | Subcommand)[] = [];
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
				return void (await respond(interaction, { embeds: [embed] }, false));
			}
			if (queue.repeatMode) {
				embed.setDescription('Stopped looping');
				queue.setRepeatMode(QueueRepeatMode.OFF);
				return void (await respond(interaction, { embeds: [embed] }, false));
			}
			queue.setRepeatMode(QueueRepeatMode.TRACK);
			embed.setDescription(`Now looping **${queue.currentTrack!.title}** by *${queue.currentTrack!.author}*.  Use \`/skip\` to continue the queue`);
			return void (await respond(interaction, { embeds: [embed] }, false));
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
