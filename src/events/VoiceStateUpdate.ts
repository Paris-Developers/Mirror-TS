import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { existsSync } from 'fs';
import path from 'path';
import { VoiceState } from 'discord.js';
import { silencedUsers } from '../slashcommands/SilenceMember';

export class VoiceStateUpdate implements EventHandler {
	eventName = 'voiceStateUpdate';
	async process(
		bot: Bot,
		oldState: VoiceState,
		newState: VoiceState
	): Promise<void> {
		if (newState.member!.user.bot){
			if(newState.member?.user.id == newState.guild.members.me!.id){
				if(!newState.channelId){
					if(bot.player.nodes.get(newState.guild)){
						bot.player.nodes.get(newState.guild)?.delete();
						return; //if mirror disconnects, destroy the queue. the player disconnect event is not reliable
					}
				}
			}
			return; //ignores bots
		}
		let ourId = newState.guild.members.me!.voice.channelId; //checks the voice channel id that mirror is sitting in
		if (newState.channelId != ourId) return; //if the new channel of the user doesnt match mirrors, end
		if (oldState.channelId == newState.channelId) return; //if the new channel and the old channel are the same, end
		if (newState.serverMute == true || newState.serverDeaf == true) return; //if the user is server muted or server deafened, end
		if (bot.player.nodes.get(newState.guild)?.isPlaying()) return; //don't play an intro over music
		let userArray = silencedUsers.ensure(newState.guild!.id, []);
		if (userArray.includes(newState.member!.id)) return; //if the user is silenced, end

		if (!newState.channel) return; //the channel isn't always cached, and the player needs it
		const intro = path.resolve(
			`data/intros/${newState.guild.id}/${newState.member!.id}.mp4`
		);
		if (!existsSync(intro)) return; //this user has no intro theme set
		await bot.player.playFile(newState.channel, intro);
		return;
	}
}
