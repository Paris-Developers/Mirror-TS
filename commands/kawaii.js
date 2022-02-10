//Call: Slash command Kawaii
//Returns a random anime winking gif
const { MessageEmbed, Permissions } = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'kawaii';

exports.run = async (client,interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    //fetches the nekos.best api
    let res = await fetch(`https://nekos.best/api/v1/wink`);
    let jsonData = await res.json();
    let embed = new MessageEmbed()
    .setColor('#0071b6')
    .setImage(jsonData.url)
    interaction.reply({embeds: [embed]});
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get a cute catgirl',
    }
};