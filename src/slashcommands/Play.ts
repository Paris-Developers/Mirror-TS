import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	Formatters,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import ytdl from 'ytdl-core';
import mkdirp from 'mkdirp';
import fs from 'fs';
import {
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
} from '@discordjs/voice';

interface Format {
	approxDurationMs: number;
}

export class Play implements SlashCommand {
	public name: string = 'play';
	public registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Play a song in the voice channel',
		options: [
			{
				name: 'video',
				type: 'STRING',
				description: 'The youtube video you want mirror to play',
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = []; //TODO add permissions
	async run(bot: Bot, interaction: CommandInteraction): Promise<void> {
		try {
			//TODO: check if Mirror is in a voice channel
			await interaction.deferReply({ ephemeral: true });
			const url = interaction.options.getString('video');
			const info = await ytdl.getInfo(url!);
			let format = info.player_response.streamingData.formats[0] as Format;
			if (format.approxDurationMs > 1000 * 60 * 60) {
				//deny videos over one hour
				interaction.editReply({
					content: 'Video is too long, select something under an hour',
				});
				return;
			}
			await mkdirp(`.data/playQueue/${interaction.guild!.id}`);
			let writeStream = fs.createWriteStream(
				`.data/playQueue/${interaction.guild!.id}/${url?.slice(-11)}.mp3`
			);
			let downloadStream = ytdl(url!, {
				filter: (format) => format.itag === 140,
			});
			downloadStream.pipe(writeStream);
			writeStream.on('finish', () => {
				interaction.editReply({
					content: 'Sucessfully download the video, enjoy!',
				});
				let connection = getVoiceConnection(interaction.guild!.id);
				let player = createAudioPlayer();
				connection!.subscribe(player);
				const audio = createAudioResource(
					`.data/playQueue/${interaction.guild!.id}/${url?.slice(-11)}.mp3`
				);
				player.play(audio);
			});
			//TODO: move to top?

			/*if (!connection) {
				interaction.editReply({
					content: 'I am not currently in a valid voice channel',
				});
				return;
			}*/

			return;
		} catch (err) {
			console.log(err);
		}
	}
}
