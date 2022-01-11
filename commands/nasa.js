// /https://api.nasa.gov/planetary/apod?(KEY)
//this function returns the nasa image of the day and a corresponding description and stuff like that smile


const {MessageEmbed} = require('discord.js');
const fetch = require("node-fetch");

exports.commandName = 'nasa';

exports.run = async (client,interaction) => {
    let res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${client.config.nasa_token}`);
    let jsonData = await res.json();
    console.log(jsonData);
    const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setAuthor(jsonData.copyright)
        .setDescription(`${jsonData.explanation.substr(0,200)}...`)
        .setFooter(`${jsonData.date} NASA Astronomy Picture of the day`)
        .setImage(jsonData.url)
        .setTitle(`**${jsonData.title}**`)
        .setURL("https://apod.nasa.gov/apod/astropix.html");
    interaction.reply({embeds:[embed]});
}

exports.registerData = {
    name: this.commandName,
    description: 'Get daily astronomy pictures',
};