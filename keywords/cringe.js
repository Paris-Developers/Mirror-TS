//Keyword: cringe
//Returns a random gif from the array below
const { Permissions } = require('discord.js');

exports.keywordName = 'cringe';

cringeDict = ["https://tenor.com/view/dies-of-cringe-cringe-gif-20747133", //
"https://tenor.com/view/dies-from-cringe-gif-22671062", //x2
"https://tenor.com/view/dies-again-from-cringe-gif-22787002", //again
"https://tenor.com/view/dies-from-cringe-dies-from-cringe-fourth-gif-22922561", //fourth
"https://tenor.com/view/killer-bean-gif-22923807", //undies
"https://tenor.com/view/dies-from-cringe-dies-fifth-time-from-cringe-gif-23530193", //fifth
"https://tenor.com/view/dies-from-cringe-dies-sixth-time-from-cringe-gif-23530194", //sixth
"https://tenor.com/view/dies-from-cringe-dies-seventh-time-from-cringe-gif-23530189", //seventh
"https://tenor.com/view/shrek-frog-dies-from-cringe-gif-21051437"]; //frog

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.keywordName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    let num = Math.floor(Math.random()*cringeDict.length);
    message.reply(cringeDict[num]);
}
