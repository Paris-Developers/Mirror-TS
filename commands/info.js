//Call: Slash command info
//Returns prewritten information about mirror and the owners
const {MessageEmbed} = require('discord.js');

exports.commandName = 'info';

exports.run = (client, interaction) => {
    const embed = new MessageEmbed()
        .setColor('#d4af37')
        .setTitle(':mirror: __Mirror__ :mirror:')
        .setThumbnail('https://i.imgur.com/xBXfVeF.png')
        .setTimestamp()
        .setDescription('Discord utility bot created by Ford, Zac, Leo (not really) and Gavin')
        .addField('__Command List:__', '$stock [TICKER]: Displays todays trading value and more for specified ticker \n$weather [city]: displays current weather for specified city \n$info: you are here! \n$test: :smile:')
        .setFooter('Created by Fordle#0001', 'https://i.imgur.com/Cq4Sbwq.jpg?1');

    interaction.reply({embeds:[embed]});
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Info about the bot',
    }
};