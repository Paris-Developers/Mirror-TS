import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';

//an embed field can't hold a whole queue, so only the next few tracks are listed
const listed = 15;

export class Queue implements SlashCommand {
	name: string = 'queue';
	description: string = 'View the music queue';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.nodes.get(interaction.guild!.id);
			if (!queue || !queue.isPlaying() || queue.tracks.size == 0)
				return void interaction.reply('There is no queue');
			let ptr = 1;
			let titleString = '';
			let artistString = '';
			let timeString = '';
			let ptrString = '.';
			for (let track of queue.tracks.toArray()) {
				ptrString = ptr.toString() + ') ';
				if (track.title.length > 42) {
					titleString =
						titleString + ptrString + track.title.slice(0, 40) + '...\n';
				} else {
					titleString = titleString + ptrString + track.title + '\n';
				}
				artistString = artistString + track.author + '\n';
				timeString = timeString + track.duration + '\n';
				ptr++;
				if (ptr > listed) break;
			}
			let footerText = `${Math.round(
				queue.estimatedDuration / 1000 / 60 / 60 - 0.5
			)} hour(s) ${Math.round(
				((queue.estimatedDuration / 1000 / 60 / 60) % 1) * 60
			)} minutes`;
			embed
				.setTitle(`Music queue for ${interaction.guild!.name}`)
				.addFields(
					{
						name: '🎶 | Now Playing',
						value: `**${queue.currentTrack!.title}**, by *${
							queue.currentTrack!.author
						}* (${queue.currentTrack!.duration})`,
						inline: false,
					},
					{
						name: '🗒️ | Queue',
						value: titleString,
						inline: true,
					},
					{
						name: '🎙️ | Artist',
						value: artistString,
						inline: true,
					},
					{
						name: '🕐 | Time',
						value: timeString,
						inline: true,
					}
				)
				.setColor(colorCheck(interaction.guild!.id,true));
			if (queue.tracks.size - listed > 0) {
				footerText = `${queue.tracks.size - listed} more tracks, ` + footerText;
			}
			embed.setFooter({ text: footerText });
			return void interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
