const Discord = require('discord.js');
const cron = require('cron');

exports.run = (client, message, args) => {
    let dailyMsg = new cron.CronJob('00 49 13 * * *',() => {
        console.log('Inside the daily command');
        const channel = '888079059249147984';
        channel.send("test timed message");
    });

}