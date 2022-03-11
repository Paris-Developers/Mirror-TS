import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import {
	getVoiceConnection,
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
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
		if (newState.member!.user.bot) return; //ignores bots
		let ourId = newState.guild.me!.voice.channelId; //checks the voice channel id that mirror is sitting in
		if (newState.channelId != ourId) return; //if the new channel of the user doesnt match mirrors, end
		if (oldState.channelId == newState.channelId) return; //if the new channel and the old channel are the same, end
		if (newState.serverMute == true || newState.serverDeaf == true) return; //if the user is server muted or server deafened, end
		let userArray = silencedUsers.ensure(newState.guild!.id, []);
		if (userArray.includes(newState.member!.id)) return; //if the user is silenced, end
		let connection = getVoiceConnection(newState.guild.id);
		if (!connection) {
			connection = joinVoiceChannel({
				channelId: newState.channelId!,
				guildId: newState.guild.id,
				adapterCreator: newState.guild.voiceAdapterCreator,
			});
		}
		let player = createAudioPlayer();
		connection.subscribe(player);
		const intro = createAudioResource(
			`./data/intros/${newState.guild.id}/${newState.member!.id}.mp4`
		);
		player.play(intro);
		return;
	}
}
