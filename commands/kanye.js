//send kanye quote randomly

const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'kanye';

exports.run = async (client,message,args) => {
    let res = await fetch(`https://api.kanye.rest/`)
    let jsonData = await res.json();
    const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription(`**${jsonData.quote}**`)
        .setFooter('Kanye West','https://imgur.com/olrP4cN.jpeg');
        
    message.channel.send({embeds:[embed]});

}