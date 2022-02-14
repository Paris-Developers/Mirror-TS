//Call: Slash command Kawaii
//Returns a random anime winking gif
const { MessageEmbed, Permissions } = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'kawaii';

exports.requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS];

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get a cute catgirl',
    }
};

exports.run = async (client,interaction) => {
    //fetches the nekos.best api
    let res = await fetch(`https://nekos.best/api/v1/wink`);
    let jsonData = await res.json();
    let embed = new MessageEmbed()
    .setColor('#0071b6')
    .setImage(jsonData.url)
    interaction.reply({embeds: [embed]});
}

