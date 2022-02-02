//Call: Slash command join
//Joins the voice channel and plays mirror intro theme!
const voice = require('@discordjs/voice');
const { Permissions } = require('discord.js');

exports.commandName = 'join';

exports.run = async (client,interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    let state = interaction.member.voice;
    if(!state.channel){
        interaction.reply('you are not in a valid voice channel!');
        return;
    }
    const connection = voice.joinVoiceChannel({
        channelId: state.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    let player = voice.createAudioPlayer();
    connection.subscribe(player);
    const mirrormp3 = voice.createAudioResource('./resources/music/mirror.mp3');
    player.play(mirrormp3);
    interaction.reply({content:'success', ephemeral: true }); //hides the reply to anyone but the user
    return;
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Have Mirror join your voice channel',
    }
}