//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
import {
	CacheType,
	ChatInputCommandInteraction,
	MessageFlags,
	ApplicationCommandOptionType,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { SlashCommand } from './SlashCommand';
import { Bot } from '../Bot';
import { silencedUsers } from './SilenceMember';
import { Option, Subcommand } from './Option';
import { downloadTrack } from '../resources/downloadTrack';
import { YoutubeExtractor } from 'discord-player-youtubei';

//how much of the chosen video is kept and played back
const INTRO_SECONDS = 5;

export class Intro implements SlashCommand {
	name: string = 'intro';
	description: string = 'Set your intro theme from a Youtube video, the first 5 seconds are used';
	options: (Option | Subcommand)[] = [
		new Option(
			'video',
			'Youtube link to intro, only its first 5 seconds are kept',
			ApplicationCommandOptionType.String,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			if (userArray.includes(interaction.user.id)) {
				return void interaction.reply({
					content: 'Silenced users cannot use this command',
					flags: MessageFlags.Ephemeral,
				});
			}
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });
			const url = interaction.options.getString('video')!;

			//resolved through the same youtube library the music commands use
			const search = await bot.player
				.searchFromUser(url, interaction.user)
				.catch(() => null);
			const track = search?.tracks[0];
			if (!track) {
				interaction.editReply({
					content: 'Please enter a valid youtube link',
				});
				return;
			}
			//Spotify, SoundCloud and Apple Music links find their song on their own site, which
			//intros can't be recorded from
			if (track.extractor?.identifier !== YoutubeExtractor.identifier) {
				interaction.editReply({
					content: 'Intros have to come from YouTube. Paste a YouTube link, or type the video\'s name to search for it.',
				});
				return;
			}
			//only the first few seconds are kept, so length barely matters, and ffmpeg stops on its
			//own even for a livestream. YouTube sometimes returns a video with no duration at all,
			//which is not a reason to refuse it, so only a known-long video is turned away
			if (track.durationMS && track.durationMS > 10 * 60 * 1000) {
				interaction.editReply({
					content: 'Please pick a video under 10 minutes',
				});
				return;
			}

			const folder = path.resolve(`data/intros/${interaction.guild!.id}`);
			await fs.promises.mkdir(folder, { recursive: true });
			await downloadTrack(
				bot.player,
				track,
				path.join(folder, `${interaction.user.id}.mp4`),
				INTRO_SECONDS
			);
			interaction.editReply({
				content: `Sucessfully updated your intro theme! The first ${INTRO_SECONDS} seconds of **${track.title}** will play when you join.`,
			});
			return;
		} catch (err: any) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.editReply({
				content: 'Error detected, contact an admin to investigate.',
			});
			return;
		}
	}
	guildRequired?: boolean = true;
}
