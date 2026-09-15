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

export class NowPlaying implements SlashCommand {
	name: string = 'nowplaying';
	description = 'Get the song that is currently playing';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription('There is no queue!');
				return void interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
			}
			let track = queue.nowPlaying();
			let trackString = `Now playing | **${track.title}**, by *${track.author}* (${track.duration})`;
			embed.setDescription(trackString).setFooter({
				text: `Requested by ${track.requestedBy.tag}`,
				iconURL: track.requestedBy.avatarURL()!,
			});
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
	musicCommand?: boolean | undefined = true;
}
