//Call: Slash command test
//Returns a greeting reply to the user
const {Permissions} = require('discord.js');

exports.commandName = 'test';

exports.run = async (client, interaction) => {
    if(!(await client.permissionCheck(client,interaction,Permissions.FLAGS.SEND_MESSAGES))){
        console.log(`Missing permissions in channel: ${interaction.channel.name}`);
        return;
    }
    interaction.reply(`Hello ${interaction.user.username}`);
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Replies with your name!',
    }
};