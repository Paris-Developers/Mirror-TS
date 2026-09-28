//Call: $superidol105
//Joins the voice channel and plays the superidol.mp3 file in the chat
//SuperIdol的笑容都没你的甜八月正午的阳光都没你耀眼热爱105°c的你滴滴清纯的蒸馏水 :D

import { Message, PermissionFlagsBits } from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';
import { VoiceJoinError, queueBusy } from '../resources/CustomPlayer';

export class Superidol implements MessageCommand {
	name: string = 'superidol105';
	//these are checked on the text channel the message was sent in. joining and speaking are checked
	//on the voice channel when Mirror joins it
	requiredPermissions: bigint[] = [PermissionFlagsBits.ManageMessages];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		//the message is deleted by then, so the reply is a plain message that says who it's for
		const tell = (content: string) =>
			message.reply({ content: `${message.author} ${content}`, failIfNotExists: false }).catch(() => {});
		try {
			let state = message.member!.voice;
			await message.delete();
			if (!state.channel) return;
			//an idle queue is fine, but don't talk over music, even between two songs
			if (queueBusy(bot.player.nodes.get(state.guild.id))) return;
			await bot.player.playFile(
				state.channel,
				path.resolve('music/superidol.mp3')
			);
		} catch (err) {
			if (err instanceof VoiceJoinError) return void (await tell(err.message));
			bot.logger.commandError(message.channelId, this.name, err);
			await tell('Error: contact a developer to investigate');
			return;
		}
	}
}
