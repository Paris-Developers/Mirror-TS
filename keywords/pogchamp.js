//Keyword: pogchamp
//Reacts to the keyword with JamesChamp
const { Permissions } = require('discord.js'); 

exports.keywordName = 'pogchamp';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.ADD_REACTIONS,Permissions.FLAGS.USE_EXTERNAL_EMOJIS]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.react(':JamesChamp:791190997236842506');
}