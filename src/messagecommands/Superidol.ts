//Call: $superidol105
//Joins the voice channel and plays the superidol.mp3 file in the chat
//SuperIdol的笑容都没你的甜八月正午的阳光都没你耀眼热爱105°c的你滴滴清纯的蒸馏水 :D

import { Message, PermissionFlagsBits } from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { MessageCommand } from './MessageCommand';

export class Superidol implements MessageCommand {
	name: string = 'superidol105';
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.Speak,
		PermissionFlagsBits.Connect,
	];
	async run(
		bot: Bot,
		message: Message<boolean>,
		args: string[]
	): Promise<void> {
		try {
			let state = message.member!.voice;
			await message.delete();
			if (!state.channel) return;
			//an idle queue is fine, but don't talk over music that is actually playing
			if (bot.player.nodes.get(state.guild.id)?.isPlaying()) return;
			await bot.player.playFile(
				state.channel,
				path.resolve('music/superidol.mp3')
			);
		} catch (err) {
			bot.logger.commandError(message.channel!.id, this.name, err);
			message.reply({
				content: 'Error: contact a developer to investigate',
			});
			return;
		}
	}
}
