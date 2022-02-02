const voice = require('@discordjs/voice');

module.exports = async (client, oldState, newState) => {
    if(newState.member.user.bot) return; //ignores bots
    let ourId = newState.guild.me.voice.channelId; 
    if(newState.channelId != ourId) return;
    if(oldState.channelId == newState.channelId) return;
    let connection = voice.getVoiceConnection(newState.guild.id);
    if(!connection){
        connection = voice.joinVoiceChannel({
            channelId: newState.channelId,
            guildId: newState.guild.id,
            adapterCreator: newState.guild.voiceAdapterCreator,
        });
    } 
    let player = voice.createAudioPlayer();
    connection.subscribe(player);
    const intro = voice.createAudioResource(`./data/intros/${newState.member.id}.mp4`);
    player.play(intro);
    return;
}