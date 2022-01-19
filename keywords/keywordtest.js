//Keyword: keywordtest
//Replys to the keyword with the users name
const { Permissions } = require('discord.js');

exports.keywordName = 'keywordtest';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.SEND_MESSAGES]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.reply(`Hello keyword user: ${message.author.username}`);
}