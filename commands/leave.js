//Call: Slash command leave
//Leaves the voice channel for the relevant guild
const { Permissions } = require('discord.js');

exports.commandName = 'leave';

exports.requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES];

exports.run = async (client, interaction) => {
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