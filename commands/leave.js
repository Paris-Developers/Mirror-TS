//Call: Slash command leave
//Leaves the voice channel for the relevant guild
const { Permissions } = require('discord.js');

exports.commandName = 'leave';

exports.run = async (client, interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    let mirrorVoice = interaction.guild.me.voice;
    if(!mirrorVoice) {
        interaction.reply({content: 'Not in a voice channel', ephemeral: true});
        return;
    } 
    mirrorVoice.disconnect();
    interaction.reply('Left the voice channel :wave:');
    return;
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Have Mirror leave your voice channel.',
    }
}