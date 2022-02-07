//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
const { Interaction } = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');
const mkdirp = require('mkdirp');

exports.commandName = 'intro';


exports.run = async (client, interaction) => {
    try{
        await interaction.deferReply({ephemeral: true});
        const url = interaction.options.getString('video');
        //TODO: validate the correct videos. 
        const info = await ytdl.getInfo(url);
        if(info.player_response.streamingData.formats[0].approxDurationMs > 12 * 1000){
            interaction.editReply({content:'Video is too long, select something 10 seconds or shorter', ephemeral: true});
            return;
        };
        await mkdirp(`./data/intros/${interaction.guild.id}`);
        let writeStream = fs.createWriteStream(`./data/intros/${interaction.guild.id}/${interaction.user.id}.mp4`);
        let downloadStream = ytdl(url, { filter: format => format.itag === 140 });
        downloadStream.pipe(writeStream);
        writeStream.on('finish', () => {
            interaction.editReply({content:'Sucessfully updated your intro theme!', ephemeral: true});
            return;
        })
        return;
    } catch(err){
        console.log(err.message);
        if(err.message == 'Status code: 410'){
            interaction.editReply('Your video is private or age restricted, please choose another');
            return;
        }
        interaction.editReply('Error detected, contact an admin to investigate.');
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