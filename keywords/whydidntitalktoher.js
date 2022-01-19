//another one off the books
//man....
//what could have been
const { Permissions } = require('discord.js');

exports.keywordName = 'whydidntitalktoher';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.ADD_REACTIONS]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.react('🇲')
        .then(() => message.react('🇦'))
        .then(() => message.react('🇳'));
}