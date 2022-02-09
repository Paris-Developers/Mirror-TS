//Call: Slash command help
//Returns the info command
const { MessageEmbed } = require('discord.js');

exports.commandName = 'help';

exports.run = async (client,interaction) => {
    //TODO: Add permission checks
    const page1 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle(':mirror: **__Mirror__**')
        .setDescription('Discord utility bot created by Ford, Zac, Leo (not really) and Gavin')
        .addFields({name: '__Command List:__', value: '**Page 1:** Voice Commands\n**Page 2:** Informative Commands\n**Page 3:** Other Commands', inline: false})
        .setFooter('Page 1 of 2');
    const page2 = new MessageEmbed()
        .setColor('#FFFFFF')
        .setTitle(':sound: **__Voice Commands__**')
        .setDescription(
           '/join: Have Mirror join the current voice call.\n'+
           '/leave: Have Mirror leave the current voice call.\n'+
           '/intro: Have Mirror set a specified youtube video as your intro theme.\n'+
           '/banintro: Allows an administrator to remove a specified users intro.\n'+
           '/sicko: :skull:')
        .setFooter('Page 2 of 2');
    // const page3 = new MessageEmbed()
    //     .setColor('#FFFFFF')
    //     .setTitle('**__Informative Commands__**')

    //     //.setTimestamp()
    //     .setDescription(
    //     '/weather: \n'+
    //     '/stock: \n'+
    //     '/news: .\n'+
    //     '/: \n'+
    //     '/:')
    //     .addField()
    //     //.setFooter();
    // const page4 = new MessageEmbed()
    //     .setColor('#FFFFFF')
    //     .setTitle('**__Other Commands__**')
    //     .setTimestamp()
    //     .setDescription(
    //     '/poll: \n'+
    //     '/kanye: \n'+
    //     '/: .\n'+
    //     '/: \n'+
    //     '/:');
    //     //.addField()
    //     //.setFooter();
    // const page5 = new MessageEmbed()
    //     .setColor('#FFFFFF');
    //     //.setTitle()s
    //     //.setThumbnail()
    //     //.setTimestamp()
    //     //.setDescription()
    //     //.addField()
    //     //.setFooter();
    let embedArray = [page1,page2];
    let index = 0;
    let message = await interaction.reply({embeds: [embedArray[index]], fetchReply: true}); //fetch the reply and store it so we can react to it and use it in the collector
    await message.react('⏪');
    await message.react('⏩');
    const filter = (reaction, user) => {
        return ['⏪', '⏩'].includes(reaction.emoji.name) && user.id === interaction.user.id;  //if reaction emoji matches one of the two in this array + it was reacted by the interaction creator
    };
    const collector = message.createReactionCollector({ filter, time: 60000 });
    collector.on('collect', (reaction, user) => {
        if (reaction.emoji.name == '⏩') {
            index += 1;
        } else if (reaction.emoji.name == '⏪') {
            index -= 1;
        } else return;
        if(index > embedArray.length -1){
            index = 0;
        } else if(index < 0){
            index = embedArray.length - 1;
        }
        message.edit({embeds: [embedArray[index]]});
        reaction.users.remove(user.id); //remove the emoji so the user doesn't have to remove it themselves
    });
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Information about the bot.'
    }
} 