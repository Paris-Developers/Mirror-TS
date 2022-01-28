//Call: $superidol105
//Joins the voice channel and plays the superidol.mp3 file in the chat
//SuperIdol的笑容都没你的甜八月正午的阳光都没你耀眼热爱105°c的你滴滴清纯的蒸馏水 :D
const voice = require('@discordjs/voice');
const { Permissions } = require('discord.js');

exports.commandName = 'superidol105';

exports.run = async (client,message,args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.MANAGE_MESSAGES,Permissions.FLAGS.SPEAK,Permissions.FLAGS.CONNECT]))){
        console.log(`Missing permissions in channel: ${message.channel.name}`);
        return;
    }
    let state = message.member.voice;
    await message.delete();
    if (!state.channelId) return;
    const connection = voice.joinVoiceChannel({
        channelId: state.channelId,
        guildId: message.channel.guild.id,
        adapterCreator: message.channel.guild.voiceAdapterCreator,
    });
    let player = voice.createAudioPlayer();
    connection.subscribe(player);
    const superidolmp3 = voice.createAudioResource('./resources/music/superidol.mp3');
    player.play(superidolmp3);
    setTimeout(() => connection.destroy(), 17000);
}
