//Call: $rock
//Returns player data from rockcrafts' fluxcup api
//Temporary fxn will be removed later
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'rock';

exports.run = async (client,message,args) => {
    let res = await fetch(`https://api.fluxcup.org/members`);
    let jsonData = await res.json();
    let str = '';
    let expert = [];
    let apprentice = [];
    for(let x in jsonData){
        str += `**__${jsonData[x].discordtags[0]}:__** \n :shield: ${jsonData[x].roleDivisons[0]} :crossed_swords: ${jsonData[x].roleDivisons[1]} :syringe: ${jsonData[x].roleDivisons[2]} \n`; 
    }
    message.channel.send(str);
    return;
}
