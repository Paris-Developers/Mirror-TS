//Call: $song
//Unfinished
//Implement try{}catch{}finish{} for error handling
const {MessageEmbed, Message} = require("discord.js");

exports.commandName = 'song';

exports.run = async (client,message,args) => {
    const embed = new MessageEmbed();
    try{
        console.log("Test1");
        let mes = client.songRecs.get(message.author.id);
        embed.setTitle(`${message.author.id}'s Song Recommendation`);
        embed.setDescription(mes);
        message.channel.send({embeds:[embed]});
    }catch(err){
        embed.setDescription('Error in the song fxn');
        message.channel.send({embeds:[embed]});
    }
}
