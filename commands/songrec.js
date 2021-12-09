const { Message } = require("discord.js");
const { MessageEmbed} = require("discord.js");

exports.run = (client, message, args, identifiedArgs) => {
    const embed = new MessageEmbed()
    try{
        console.log("Hey")
        console.log(`${message.author.id}`);
        client.songRecs.set(message.author.id, args[0]);
        console.log("past songRecs.set");
        let mes = client.songRecs.get(message.author.id);
        console.log("past the songRecs.get");
        embed.setDescription(mes);
        message.channel.send({embeds:[embed]});
    } catch (err){
        embed.setDescription('Error in songrec fxn: returning');
        return;
    }
}