const {MessageEmbed} = require('discord.js');

exports.commandName = 'poll';

emoteArray = [
    '1️⃣',
    '2️⃣',
    '3️⃣',
    '4️⃣',
    '5️⃣',
    '6️⃣'
];

exports.run = async (client, message, args) => {
    if(args.length > 6){
        message.reply('Too many arguements');
        return;
    }
    const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle('TestPoll.test xD'); 
    for(arg in args){
        //embed.addField('test');
        embed.addField(`${emoteArray[arg]} ${args[arg]}`,'[ | | | | | | | | ]',false);
        console.log(`Sucessful addition of ${args[arg]}`);
    }

    message.channel.send({embeds:[embed]})
        .then(function(message) {
            for(arg in args){
                message.react(emoteArray[arg]);
            }      
        });
    return;
}