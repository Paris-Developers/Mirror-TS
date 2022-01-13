//Call: Slash command nasa
//Returns the Nasa Image of the Day and corresponding description
const {MessageEmbed} = require('discord.js');
const fetch = require("node-fetch");

exports.commandName = 'nasa';

exports.run = async (client,interaction) => {
    interaction.deferReply(); // this command can take a while to respond, so we need to defer the reply.
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
    interaction.editReply({embeds:[embed]}); //technically deferReply() creates the reply, so we need to edit that.
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get daily astronomy pictures',
    }
};