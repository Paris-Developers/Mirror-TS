//This fxn will not be going on the documentation
//today got me like....
//god really made me fall in love overnight
//sheesh....
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.run = async (client,message,args) => {
    let res = await fetch(`https://nekos.best/api/v1/cry`);
    let jsonData = await res.json();
    let embed = new MessageEmbed()
    .setColor('#0071b6')
    .setImage(`${jsonData.url}`)
    .setFooter('I feel you bro');
    message.channel.send({embeds: [embed]});
}
