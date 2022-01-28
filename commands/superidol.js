//Call: $superidol105
//Joins the voice channel and plays the superidol.mp3 file in the chat
//SuperIdol的笑容都没你的甜八月正午的阳光都没你耀眼热爱105°c的你滴滴清纯的蒸馏水 :D
const voice = require('@discordjs/voice');

exports.commandName = 'superidol105';

exports.run = async (client,message,args) => {
    let state = message.member.voice;
    if (!state.channelId) return;
    const connection = voice.joinVoiceChannel({
        channelId: state.channelId,
        guildId: message.channel.guild.id,
        adapterCreator: message.channel.guild.voiceAdapterCreator,
    });
    await message.delete();
    let player = voice.createAudioPlayer();
    connection.subscribe(player);
    const superidolmp3 = voice.createAudioResource('./resources/music/superidol.mp3');
    player.play(superidolmp3);
    setTimeout(() => connection.destroy(), 17000);
}
