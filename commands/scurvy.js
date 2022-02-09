//Hidden command $scurvy, pretty lit

const { Permissions } = require('discord.js');

exports.commandName = 'scurvy';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS,Permissions.FLAGS.MANAGE_MESSAGES]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    await message.delete();
    message.channel.send('https://cdn.discordapp.com/attachments/888079059249147984/941073475362234368/scurvy.jpg');
    return;
}