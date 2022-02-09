//Call: Slash command nasa
//Returns the Nasa Image of the Day and corresponding description
const { MessageEmbed, Permissions } = require('discord.js');
const fetch = require("node-fetch");

exports.commandName = 'nasa';

exports.run = async (client,interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    await interaction.deferReply(); // this command can take a while to respond, so we need to defer the reply.
    let res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${client.config.nasa_token}`);
    let jsonData = await res.json();
    let footer = `${jsonData.date} NASA Astronomy Picture of the day`; //we need this for the deprecation error we are getting with .setFooter()
    console.log(jsonData); // <- remove eventually;
    var embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setDescription(`${jsonData.explanation.substr(0,200)}...`)
    .setFooter(footer)
    .setImage(jsonData.url)
    .setTitle(`**${jsonData.title}**`)
    .setURL("https://apod.nasa.gov/apod/astropix.html");
    if(jsonData.copyright) embed.setAuthor(jsonData.copyright);  //checks to see if the copyright item exists, then it will include it in the author slot.
    interaction.editReply({embeds: [embed] }); //technically deferReply() creates the reply, so we need to edit that.
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get daily astronomy pictures',
    }
};