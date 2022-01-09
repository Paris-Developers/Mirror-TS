const {MessageEmbed, ReactionCollector, Message} = require('discord.js');

exports.commandName = 'poll';

// let emoteVal = {
//     '1️⃣': 0,
//     '2️⃣': 0,
//     '3️⃣': 0,
//     '4️⃣': 0,
//     '5️⃣': 0,
//     '6️⃣': 0
// };
const emoteIndex = {
    '1️⃣': 0,
    '2️⃣': 1,
    '3️⃣': 2,
    '4️⃣': 3,
    '5️⃣': 4,
    '6️⃣': 5
};



exports.run = async (client, message, args) => {
    
    if(args.length > 6){
        message.reply('Too many arguements');
        return;
    }
    const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle('TestPoll.test xD'); 
    let emoteVal = {
        '1️⃣': 0,
        '2️⃣': 0,
        '3️⃣': 0,
        '4️⃣': 0,
        '5️⃣': 0,
        '6️⃣': 0
    };
    const emoteKeys = Object.keys(emoteVal);
    for(let arg in args){
        //embed.addField('test');
        embed.addField(`${emoteKeys[arg]} ${args[arg]}`,'0%',false);
        console.log(`Sucessful addition of ${args[arg]}`);
    }

    let msg = await message.channel.send({embeds:[embed]})
    for(arg in args){
        msg.react(emoteKeys[arg]);
    } 
    const filter = (reaction, user) => {
        return !user.bot;
    }

    let total = 0;  
    const collector = msg.createReactionCollector({filter, time:200000});
    collector.on('collect', (reaction,user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        total += 1;
        emoteVal[reaction.emoji.name] += 1;
        console.log(emoteVal[reaction.emoji.name]);
        let index = emoteIndex[reaction.emoji.name];
        for(arg in args){
            console.log(arg);
            console.log(emoteVal[emoteKeys[arg]]);
            embed.fields[arg] = {name: `${emoteKeys[arg]} ${args[arg]}`, value: `${(emoteVal[emoteKeys[arg]]/total)*100}%`};
        }
        msg.edit({embeds:[embed]});    
    })
    collector.on('end',collected => {
        console.log(`Ending collection, Collected ${total} items.`);
        console.log(emoteVal)
    }) 


}
// const reprint(args,embed) => {
//     console.log(args);
//     for(arg in args){
//         embed.fields[arg] = {name: `${emoteKeys[arg]} ${args[index]}`, Value: `${emoteVal[arg]/total}`};
//     }
//     return embed;
// }