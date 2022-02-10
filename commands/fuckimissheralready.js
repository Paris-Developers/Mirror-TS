//This fxn will not be going on the documentation
//today got me like....
//god really made me fall in love overnight
//sheesh....
//god damn im so scared
//actually rent free
//got me so depressed im actually doing school work, thats a new low
//update? Still in love, I just want to hold her close
const {MessageEmbed,Permissions, Message} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'fuckimissheralready';

exports.run = async (client,message,args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.MANAGE_MESSAGES,Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions in channel: ${message.channel.name}`);
        return;
    }
    await message.delete();
    let res = await fetch(`https://nekos.best/api/v1/cry`);
    let jsonData = await res.json();
    let embed = new MessageEmbed()
    .setColor('#0071b6')
    .setImage(jsonData.url)
    .setFooter('I feel you bro');
    message.channel.send({embeds: [embed]});
}
