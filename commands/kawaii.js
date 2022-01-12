const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'kawaii';

exports.run = async (client,interaction) => {
    let res = await fetch(`https://nekos.best/api/v1/wink`);
    let jsonData = await res.json();
    let embed = new MessageEmbed()
    .setColor('#0071b6')
    .setImage(`${jsonData.url}`)
    interaction.reply({embeds: [embed]});
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get a cute catgirl',
    }
};