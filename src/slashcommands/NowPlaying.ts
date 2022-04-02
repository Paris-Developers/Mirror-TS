import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';

export class NowPlaying implements SlashCommand {
	name: string = 'nowplaying';
	description = 'Get the song that is currently playing';
	options = [];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription('There is no queue!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			let track = queue.nowPlaying();
			let trackString = `Now playing | **${track.title}**, by *${track.author}* (${track.duration})`;
			embed.setDescription(trackString).setFooter({
				text: `Requested by ${track.requestedBy.tag}`,
				iconURL: track.requestedBy.avatarURL()!,
			});
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
	musicCommand?: boolean | undefined = true;
}
