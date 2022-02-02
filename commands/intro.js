//Call: Slash command intro
//Sets an intro theme for a user. Youtube link
const { Interaction } = require('discord.js');
//const ffmpegPath = require('ffmpeg-static');
//const fs = require('fs');
//const ytdl = require('ytdl-core');
//var ffmpeg = require('ffmpeg');
const yt = require('youtube-mp3-downloader');

exports.commandName = 'intro';

exports.run = async (client, interaction) => {
    const link = interaction.options.getString('video')
    const id = link.substr(-11,11);
    var video = new yt({
        "ffmpegPath": ,
        "outputPath": './data/intros/'
    })
    
    // console.log(interaction.options.getString('video'));
    // let info = await ytdl.getInfo(interaction.options.getString('video'), { quality: 'highestaudio' });
    // let stream = ytdl.downloadFromInfo(info, {quality: 'highestaudio'});
    // ffmpeg(stream)
    // //let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    // //console.log(audioFormats[0] + ' ' + audioFormats.length);``
    // //interaction.editReply('hey there! xD');

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