//penis pie makes the chicken cry
const { Permissions } = require('discord.js');

exports.commandName = 'cum';
exports.run = async (client,message,args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    let rand = Math.round(100*Math.random());
    if (rand==69){
        message.reply("You are the scrumple king");
        return;
    }
    message.channel.send("Absolutely nothing");
}