//Call: Slash command info
//Returns prewritten information about mirror and the owners
const { MessageEmbed, Permissions} = require('discord.js');

exports.commandName = 'info';

exports.run = async (client, interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    const embed = new MessageEmbed()
        .setColor('#d4af37')
        .setTitle(':mirror: __Mirror__ :mirror:')
        .setThumbnail('https://i.imgur.com/xBXfVeF.png')
        .setTimestamp()
        .setDescription('Discord utility bot created by Ford, Zac, Leo (not really) and Gavin')
        .addField('__Command List:__', '$stock [TICKER]: Displays todays trading value and more for specified ticker \n$weather [city]: displays current weather for specified city \n$info: you are here! \n$test: :smile:')
        .setFooter('Created by Fordle#0001', 'https://i.imgur.com/Cq4Sbwq.jpg?1');

    interaction.reply({embeds:[embed]});
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Info about the bot',
    }
};