const voice = require('@discordjs/voice');

module.exports = async (client, oldState, newState) => {
    if(newState.member.user.bot) return; //ignores bots
    let ourId = newState.guild.me.voice.channelId; //checks the voice channel id that mirror is sitting in
    if(newState.channelId != ourId) return; //if the new channel of the user doesnt match mirrors, end
    if(oldState.channelId == newState.channelId) return; //if the new channel and the old channel are the same, end
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
    const intro = voice.createAudioResource(`./data/intros/${newState.guild.id}/${newState.member.id}.mp4`);
    player.play(intro);
    return;
}