//Call $songrec
//Recommends a song and sets the user and songlink into the Enmap songRecs
//Unfinished
const { MessageEmbed} = require("discord.js");

exports.commandName = 'songrec';

exports.run = (client, interaction) => {
    const embed = new MessageEmbed()
    try{
        console.log("Hey")
        console.log(interaction.user.id);
        client.songRecs.set(interaction.user.id, interaction.options.getString("song"));
        console.log("past songRecs.set");
        let mes = client.songRecs.get(interaction.user.id);
        console.log("past the songRecs.get");
        embed.setDescription(mes);
        interaction.reply({embeds:[embed]});
    } catch (err){
        embed.setDescription(`Error: ${err}`);
        interaction.reply({embeds:[embed]});
        return;
    }
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Set your song recommendation',
        options: [{
            name: 'song',
            type: 'STRING',
            description: 'Song to recommend',
            required: true
        }]
    }
};