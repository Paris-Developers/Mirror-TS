import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { Guild, VoiceChannel } from 'discord.js';
import { Bot } from '../Bot';

export class Distortion {
    async join(
        bot: Bot,
        channel: VoiceChannel,
        guild: Guild,

    ): Promise<boolean> {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        })
        let player = createAudioPlayer();
        connection.subscribe(player);
        return true
    }
}
