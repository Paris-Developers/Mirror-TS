import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import {
	getVoiceConnection,
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
} from '@discordjs/voice';
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
			if(newState.member?.user.id == newState.guild.me!.id){
				if(!newState.channelId){
					if(bot.player.getQueue(newState.guild)){
						//@ts-ignore
						bot.player.getQueue(newState.guild).destroy();
						return; //if mirror disconnects, destroy the queue. the player.on('disconnect') event is not reliable
					}
				}
			}
			return; //ignores bots
		}
		let ourId = newState.guild.me!.voice.channelId; //checks the voice channel id that mirror is sitting in
		if (newState.channelId != ourId) return; //if the new channel of the user doesnt match mirrors, end
		if (oldState.channelId == newState.channelId) return; //if the new channel and the old channel are the same, end
		if (newState.serverMute == true || newState.serverDeaf == true) return; //if the user is server muted or server deafened, end
		if (bot.player.getQueue(newState.guild)) return; //if there is a player queue available, end TODO? we may want to remove this later
		let userArray = silencedUsers.ensure(newState.guild!.id, []);
		if (userArray.includes(newState.member!.id)) return; //if the user is silenced, end
		let connection = getVoiceConnection(newState.guild.id);
		if (!connection) {
			connection = joinVoiceChannel({
				channelId: newState.channelId!,
				guildId: newState.guild.id,
				adapterCreator: newState.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
			});
		}
		let audioPlayer = createAudioPlayer();
		connection.subscribe(audioPlayer);
		const intro = createAudioResource(
			`./data/intros/${newState.guild.id}/${newState.member!.id}.mp4`
		);
		audioPlayer.play(intro);
		return;
	}
}
