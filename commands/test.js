//Call: Slash command test
//Returns a greeting reply to the user
const { Permissions } = require('discord.js');

exports.commandName = 'test';

exports.requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES];

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Replies with your name!',
    }
};

exports.run = async (client, interaction) => {
    interaction.reply(`Hello ${interaction.user.username}`);
}

