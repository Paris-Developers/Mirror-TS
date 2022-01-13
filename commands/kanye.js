//Call: Slash command kanye
//Returns a random kanye quote
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'kanye';

exports.run = async (client,interaction) => {
    let res = await fetch(`https://api.kanye.rest/`)
    let jsonData = await res.json();
    const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription(`**${jsonData.quote}**`)
        .setFooter('Kanye West','https://imgur.com/olrP4cN.jpeg');
    interaction.reply({embeds:[embed]});
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Kanye',
    }
};