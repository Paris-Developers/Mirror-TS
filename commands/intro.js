//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
const { Interaction } = require('discord.js');
const fs = require('fs');
const ytdl = require('ytdl-core');

exports.commandName = 'intro';

//testing here

exports.run = async (client, interaction) => {
    const url = interaction.options.getString('video');
    //TODO: validate the correct videos. 
    const info = await ytdl.getInfo(url);
    //console.log(info);
    console.log(info.player_response.streamingData.formats[0].approxDurationMs);
    fs.writeFileSync('./log.txt', JSON.stringify(info,null,2)); //TODO: add the event for the download finishing!
    ytdl(url, { filter: format => format.itag === 140 }).pipe(fs.createWriteStream(`./data/intros/${interaction.user.id}.mp4`));
}
exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Get your song recommendation',
        options: [{
            name: 'video',
            type: 'STRING',
            description: 'Youtube link to  ',
            required: true
        }]

    }
};