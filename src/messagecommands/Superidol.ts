//Call: $superidol105
//Joins the voice channel and plays the superidol.mp3 file in the chat
//SuperIdol的笑容都没你的甜八月正午的阳光都没你耀眼热爱105°c的你滴滴清纯的蒸馏水 :D

import {
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
	joinVoiceChannel,
} from '@discordjs/voice';
import { Message, Permissions, TextChannel } from 'discord.js';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Superidol implements MessageCommand {
	name: string = 'superidol105';
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.MANAGE_MESSAGES,
		Permissions.FLAGS.SPEAK,
		Permissions.FLAGS.CONNECT,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			let state = message.member!.voice;
			await message.delete();
			if (!state.channelId) return;
			let channel = message.channel as TextChannel;
			const connection = joinVoiceChannel({
				channelId: state.channelId,
				guildId: channel.guild.id,
				adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			});
			let player = createAudioPlayer();
			connection.subscribe(player);
			const superidolmp3 = createAudioResource('./music/superidol.mp3');
			player.play(superidolmp3);
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
