//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
const { Interaction } = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

exports.commandName = 'intro';

//testing here

exports.run = async (client, interaction) => {
    try{
        await interaction.deferReply({ephemeral: true});
        const url = interaction.options.getString('video');
        //TODO: validate the correct videos. 
        const info = await ytdl.getInfo(url);
        //console.log(info);
        if(info.player_response.streamingData.formats[0].approxDurationMs > 12 * 1000){
            interaction.editReply({content:'Video is too long, select something 10 seconds or shorter', ephemeral: true});
            return;
        };
        //TODO: add the event for the download finishing!
        let writeStream = fs.createWriteStream(`./data/intros/${interaction.user.id}.mp4`);
        let downloadStream = ytdl(url, { filter: format => format.itag === 140 });
        downloadStream.pipe(writeStream);
        writeStream.on('finish', () => {
            interaction.editReply({content:'Sucessfully updated your intro theme!', ephemeral: true});
        })
        return;
    } catch(err){
        console.log(err);
        interaction.reply('Error detected');
        return;
    }
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Update your intro theme!',
        options: [{
            name: 'video',
            type: 'STRING',
            description: 'Youtube link to intro',
            required: true
        }]
    }
};