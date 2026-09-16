//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
import {
	CacheType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	MessageFlags,
	ApplicationCommandOptionType,
} from 'discord.js';
import fs from 'fs';
import ytdl from '@distube/ytdl-core';
import { SlashCommand } from './SlashCommand';
import { Bot } from '../Bot';
import { silencedUsers } from './SilenceMember';
import { Option, Subcommand } from './Option';

interface Format {
	approxDurationMs: number;
}

export class Intro implements SlashCommand {
	name: string = 'intro';
	description: string = 'Set your intro theme, must be a Youtube video under 10 seconds';
	options: (Option | Subcommand)[] = [
		new Option(
			'video',
			'Youtube link to intro',
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
			const url = interaction.options.getString('video');
			//TODO: validate the correct videos.
			const info = await ytdl.getInfo(url!);
			let format = info.player_response.streamingData.formats[0] as Format;
			if (format.approxDurationMs > 12 * 1000) {
				interaction.editReply({
					content: 'Video is too long, select something 10 seconds or shorter',
				});
				return;
			}
			await fs.promises.mkdir(`./data/intros/${interaction.guild!.id}`, { recursive: true });
			let writeStream = fs.createWriteStream(
				`./data/intros/${interaction.guild!.id}/${interaction.user.id}.mp4`
			);
			let downloadStream = ytdl(url!, {
				filter: (format) => format.itag === 140,
			});
			downloadStream.pipe(writeStream);
			writeStream.on('finish', () => {
				interaction.editReply({
					content: 'Sucessfully updated your intro theme!',
				});
				return;
			});
			return;
		} catch (err: any) {
			if (err.message == "This is a private video. Please sign in to verify that you may see it."){
				interaction.editReply('Video is private, please use another video that I can access');
				return;
			}
			if (err.message.substr(0,18) == 'No video id found:'){
				interaction.editReply('Please enter a valid youtube link');
				return;
			}
			if (err == 'Error: Not a YouTube domain') {
				interaction.editReply('Please enter a valid youtube link');
				return;
			}
			if (err.message == 'Status code: 410') {
				interaction.editReply(
					'Your video is private or age restricted, please choose another'
				);
				return;
			}
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.editReply({
				content: 'Error detected, contact an admin to investigate.',
			});
			return;
		}
	}
	guildRequired?: boolean = true;
}
