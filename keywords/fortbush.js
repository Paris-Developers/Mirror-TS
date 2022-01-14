//keyword: fortbush emoji;
//Reacts to the fortbush with a fortbush :D
const { Permissions } = require('discord.js');

exports.keywordName = '<:fortbush:816549663812485151>'

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.ADD_REACTIONS,Permissions.FLAGS.USE_EXTERNAL_EMOJIS]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.react(':FortBush:816549663812485151');
}