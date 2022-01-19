//Call: Slash command kanye
//Returns a random kanye quote
const { MessageEmbed, Permissions } = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'kanye';

exports.run = async (client,interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
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