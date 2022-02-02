//Call: slash command Mirror
//returns a dank imagage
const { Permissions } = require('discord.js');

exports.commandName = 'mirror';

exports.run = async (client,interaction) => {
    interaction.reply('https://cdn.discordapp.com/attachments/668116812680003597/933108457463230464/IMG_3906.png');
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Mirror go brrrr',
    }
};