//Keyword: mirror
//Reacts to the keyword with the eyes emoji
const { Permissions } = require('discord.js');

exports.keywordName = 'mirror';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.ADD_REACTIONS]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.react('👀');
}