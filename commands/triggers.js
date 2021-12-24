const {MessageEmbed} = require('discord.js');

exports.commandName = 'triggers';

exports.run = (client, message, args) => {
    let triggerString = '';
    let triggers = client.triggers.ensure(message.guild.id, []);
    let index = 1; //start index at 1 for user readability
    for(let trigger of triggers) {
        let times = trigger.cronTime.split(" "); //split the times up because we just want hours and minutes
        let time = `${times[1]}:${times[0]} CST`; // ex 5:30 CST , index 1 is hours, 0 is minutes
        triggerString += `[**${index}**] ${trigger.commandName}(${trigger.args.join(" ")}) at ${time}\n`; //construct string to display, .join string modifier on arrays
        index++;
    }
    const embed = new MessageEmbed()
        .setColor('#d4af37')
        .setTitle('Triggers')
        .addField('__Current command triggers:__', triggerString != '' ? triggerString : 'None'); //check if triggerstring has actual content

    message.channel.send({embeds:[embed]}); 
}