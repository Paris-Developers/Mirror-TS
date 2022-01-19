const { Permissions } = require('discord.js');

exports.keywordName = '!warn';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.SEND_MESSAGES]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.reply('https://tenor.com/view/discord-meme-spooked-scared-mod-gif-18361254');
    return;
}