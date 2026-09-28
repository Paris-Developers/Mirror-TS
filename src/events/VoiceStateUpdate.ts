import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { existsSync } from 'fs';
import path from 'path';
import { VoiceState } from 'discord.js';
import { VoiceConnectionStatus } from 'discord-voip';
import { silencedUsers } from '../slashcommands/SilenceMember';
import { handledHere } from '../resources/instanceGuard';
import { queueBusy } from '../resources/CustomPlayer';

export class VoiceStateUpdate implements EventHandler {
	eventName = 'voiceStateUpdate';
	async process(
		bot: Bot,
		oldState: VoiceState,
		newState: VoiceState
	): Promise<void> {
		if (!handledHere(bot, newState.guild.id)) return;
		if (newState.member?.user.bot) {
			if (newState.id === newState.guild.members.me?.id && !newState.channelId) {
				//Mirror left voice. the player already cleans up a queue whose connection was working,
				//and a join in progress expects Mirror to drop out and come back, so only a queue left
				//behind without a connection is thrown away here
				const queue = bot.player.nodes.get(newState.guild);
				const connection = queue?.connection;
				const stranded = !connection || connection.state.status === VoiceConnectionStatus.Destroyed;
				if (queue && stranded && !bot.player.isJoining(newState.guild.id)) queue.delete();
			}
			return; //ignores bots
		}
		let ourId = newState.guild.members.me?.voice.channelId; //checks the voice channel id that mirror is sitting in
		if (!ourId || newState.channelId != ourId) return; //if the new channel of the user doesnt match mirrors, end
		if (oldState.channelId == newState.channelId) return; //if the new channel and the old channel are the same, end
		if (newState.serverMute == true || newState.serverDeaf == true) return; //if the user is server muted or server deafened, end
		if (queueBusy(bot.player.nodes.get(newState.guild))) return; //don't play an intro over music, even between songs
		let userArray = silencedUsers.ensure(newState.guild!.id, []);
		if (userArray.includes(newState.id)) return; //if the user is silenced, end

		if (!newState.channel) return; //the channel isn't always cached, and the player needs it
		const intro = path.resolve(
			`data/intros/${newState.guild.id}/${newState.id}.mp4`
		);
		if (!existsSync(intro)) return; //this user has no intro theme set
		try {
			//if someone moved Mirror elsewhere while this intro waited its turn, it stays there
			await bot.player.playFile(newState.channel, intro, { move: false });
		} catch (error) {
			//there's no one to tell, so a failed intro is only logged
			bot.logger.warn(
				`[${newState.guild.name}] Could not play the intro for ${newState.member?.user.tag ?? newState.id}: ${error instanceof Error ? error.message : error}`
			);
		}
	}
}
