//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
} from 'discord.js';
import fs from 'fs';
import ytdl from 'ytdl-core';
import mkdirp from 'mkdirp';
import { SlashCommand } from './SlashCommand';
import { Bot } from '../Bot';

interface Format {
	approxDurationMs: number;
}

export class Intro implements SlashCommand {
	name: string = 'intro';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Update your intro theme!',
		options: [
			{
				name: 'video',
				type: 'STRING',
				description: 'Youtube link to intro',
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			await interaction.deferReply({ ephemeral: true });
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
			await mkdirp(`./data/intros/${interaction.guild!.id}`);
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
			bot.logger.warn(err.message);
			if (err.message == 'Status code: 410') {
				interaction.editReply(
					'Your video is private or age restricted, please choose another'
				);
				return;
			}
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.editReply('Error detected, contact an admin to investigate.');
			return;
		}
	}
	guildRequired?: boolean = true;
}
