//Keyword: Mirror emoji
//Reacts to the Mirror Emoji with the Mirror Emoji
const { Permissions } = require('discord.js');

exports.keywordName = '🪞';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.ADD_REACTIONS]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.react('🪞');
}
