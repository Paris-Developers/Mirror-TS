const { MessageEmbed } = require('discord.js');

exports.commandName = 'github';

exports.run = (client, interaction) => {
    //TODO: Permissions Check
    const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle('Mirror-JS Github')
        .setDescription('')
        .setURL('https://github.com/FordFriedel/Mirror-JS');
    interaction.reply({embeds: embed});
    return;






    //TODO: Error handling
}

exports.registerData = (client) => {
    return{
        name: this.commandName,
        description: 'information about contributing to Mirror and a link to our github'
    }
}