const { Permissions } = require('discord.js');

exports.commandName = 'support';

exports.requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS];

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Join Mirrors public support server'
    }
};

exports.run = async (client, interaction) => {
    interaction.reply('discord.gg/uvdg2R5PAU');
    return;

    //TODO Error Handling
}