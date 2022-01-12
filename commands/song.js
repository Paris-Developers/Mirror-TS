//Call: $song
//Unfinished
//Implement try{}catch{}finish{} for error handling
const {MessageEmbed, Message} = require("discord.js");

exports.commandName = 'song';

exports.run = async (client, interaction) => {
    const embed = new MessageEmbed();
    try{
        console.log("Test1");
        let mes = client.songRecs.get(interaction.user.id);
        embed.setTitle(`${interaction.user.id}'s Song Recommendation`);
        embed.setDescription(mes);
        interaction.reply({embeds:[embed]});
    }catch(err){
        embed.setDescription('Error in the song fxn');
        interaction.reply({embeds:[embed]});
    }
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get your song recommendation',
    }
};