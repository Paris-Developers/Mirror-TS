import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	Message,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Queue implements SlashCommand {
	name: string = 'queue';
	description: string = 'View the music queue';
	options = [];
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: this.description,
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor('BLUE');

			let member = interaction.member as GuildMember;
			let state = member.voice.channel;

			//if user is not connected
			if (!state) {
				embed.setDescription('You are not connected to a voice channel!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if mirror is not connected to voice
			if (!interaction.guild!.me?.voice) {
				embed.setDescription(
					'Mirror is not connected to a voice channel, use `/join`'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if the user is not connected to the correct voice, end
			if (interaction.guild!.me?.voice.channel!.id != state.id) {
				embed.setDescription(
					'Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			let queue = player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing || queue.tracks.length == 0)
				return interaction.reply('There is no queue');
			let ptr = 1;
			let titleString = '';
			let artistString = '';
			let timeString = '';
			let ptrString = '.';
			for (let track of queue.tracks) {
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
				if (ptr == 16) break;
			}
			let footerText = `${Math.round(
				queue.totalTime / 1000 / 60 / 60 - 0.5
			)} hour(s) ${Math.round(
				((queue.totalTime / 1000 / 60 / 60) % 1) * 60
			)} minutes`;
			embed
				.setTitle(`Music queue for ${interaction.guild!.name}`)
				.addFields(
					{
						name: '🎶 | Now Playing',
						value: `**${queue.nowPlaying().title}**, by *${
							queue.nowPlaying().author
						}* (${queue.nowPlaying().duration})`,
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
				.setColor('BLUE');
			if (queue.tracks.length - 16 > 0) {
				footerText = `${queue.tracks.length - 16} more tracks, ` + footerText;
			}
			embed.setFooter({ text: footerText });
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
}
