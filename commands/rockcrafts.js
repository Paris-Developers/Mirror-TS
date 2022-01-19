//Call: Slash command rockcrafts
//Returns player data from rockcrafts' fluxcup api
//Temporary fxn will be removed later
const { MessageEmbed, Permissions } = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'rock';

exports.run = async (client,interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.MANAGE_MESSAGES,Permissions.FLAGS.ADD_REACTIONS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    let res = await fetch(`https://api.fluxcup.org/members`);
    let jsonData = await res.json();
    let lines = [] //create an array we can iterate through
    for(let user of jsonData){
        lines.push(`[${lines.length+1}]**__${user.discordtags[0]}:__** \n :shield: ${user.roleDivisons[0]} :crossed_swords: ${user.roleDivisons[1]} :syringe: ${user.roleDivisons[2]} \n`); 
    }

    let lowerIndex = 0;
    let upperIndex = 5;
    let toPrint = '';
    for (let line of lines.slice(lowerIndex,upperIndex)) {
        toPrint += line;
    }
    let message = await interaction.reply({content: toPrint, fetchReply: true}); //fetch the reply and store it so we can react to it and use it in the collector
    await message.react('⏪');
    await message.react('⏩');
    const filter = (reaction, user) => {
        return ['⏪', '⏩'].includes(reaction.emoji.name) && user.id === interaction.user.id;  //if reaction emoji matches one of the two in this array + it was reacted by the interaction creator
    };


    const collector = message.createReactionCollector({ filter, time: 60000 });
    collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name == '⏩') {
            lowerIndex += 5;
        } else if (reaction.emoji.name == '⏪') {
            lowerIndex -= 5;
        } else return;
        if (lowerIndex < 0) {
            lowerIndex = lines.length - (lines.length % 5); // set the last page to start at the length minus remainder, just in case we have a length not divisble by five
        }
        upperIndex = lowerIndex + 5;
        if (upperIndex > lines.length) upperIndex = lines.length; // dont go out of bounds
        if (lowerIndex >= lines.length) { //restart from the beginning if we run out of content
            lowerIndex = 0
            upperIndex = 5;
        }
        let toPrint = '';
        for (let line of lines.slice(lowerIndex, upperIndex)) {
            toPrint += line;
        }
        message.edit(toPrint);
        reaction.users.remove(user.id); //remove the emoji so the user doesn't have to remove it themselves
    });

    return;
}


exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Information about RockCrafts',
    }
};