//Referenced from Sicko.ts
//Call it when you're leaving to go eat food 

import {
    getVoiceConnection,
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    AudioPlayerError,
} from '@discordjs/voice';
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	GuildMember,
	Permissions,
	VoiceState,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Munch implements SlashCommand {
	name: string = 'munch';
	description: string = 'Time to go munch some grub. But I will return.';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.DEAFEN_MEMBERS];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let state = member.voice;
			if (!state.channel) {
				interaction.reply('you are not in a valid voice channel!');
				return;
			}
			let queue = bot.player.getQueue(interaction.guild!.id);
			if (queue) {
				interaction.reply('Cant go munch while music is playing :sob:');
				return;
			}
			const connection = joinVoiceChannel({
				channelId: state.channelId!,
				guildId: interaction.guildId!,
				adapterCreator: interaction.guild!.voiceAdapterCreator,
			});
			let audio = createAudioPlayer();
			connection.subscribe(audio);
			const munchmp3 = createAudioResource('./music/minecraft-eating-sound.mp3');
			audio.play(munchmp3);
			if(state.deaf){
				interaction.reply(`<@${interaction.user.id}>` + 'had a nice lunch.');
				state.setDeaf(false, "no longer eating")
				return;
			}
			else{
				interaction.reply(`<@${interaction.user.id}>` + 'has gone to munch a lunch.');
				state.setDeaf(true, "eating")
			return;
			}
			
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean = true;
}
