//Call: Slash command poll

const {MessageEmbed, ReactionCollector, Message, Permissions} = require('discord.js');

exports.commandName = 'poll';

const emoteIndex = {
    '1️⃣': 0,
    '2️⃣': 1,
    '3️⃣': 2,
    '4️⃣': 3,
    '5️⃣': 4,
    '6️⃣': 5
};

exports.run = async (client, interaction) => { 
    //Checks discord permissions for the guild
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.MANAGE_MESSAGES,Permissions.FLAGS.ADD_REACTIONS,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    //TODO: error test for empty arguements

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

    //We want to create an array of keys so that we can reference it more easily when writing the embed
    const emoteKeys = Object.keys(emoteVal);

    //fill and send embed with fields for each poll option selected
    let ctr = 0;
    for(let arg of interaction.options.data){
        embed.addField(`${emoteKeys[ctr]} ${arg.value}`,'0%',false);
        console.log(`Sucessful addition of ${arg.value}`);
        ctr += 1;
    }
    let message = await interaction.reply({embeds:[embed], fetchReply: true});

    //react to the interaction for each arguement
    for(let arg in interaction.options.data){
        await message.react(emoteKeys[arg]);
    } 

    //create a filter to not count bot votes to our reactions
    const filter = (reaction, user) => {
        return !user.bot;
    }

    //creates collector to measure reactions and change the embed as needed
    let total = 0;  
    const collector = message.createReactionCollector({ filter, time: 200000});
    collector.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        total += 1;
        emoteVal[reaction.emoji.name] += 1; //saves number of votes for each emoji
        console.log(emoteVal[reaction.emoji.name]);
        ctr = 0;
        for(let arg of interaction.options.data){ //rewrite the embed and send the edits
            embed.fields[ctr] = {name: `${emoteKeys[ctr]} ${arg.value}`, value: `${(emoteVal[emoteKeys[ctr]]/total)*100}%`};
            ctr += 1;
        }
        message.edit({embeds:[embed]});
    })
    //when the collectors end send a message to the console.
    collector.on('end',collected => {
        console.log(`Ending collection, Collected ${total} items. ${emoteVal}`);
    }) 
}
exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Create a quick poll with up to 5 options',
        options: [{
            name: 'arguement1',
            type: 'STRING',
            description: 'first poll option',
            required: true
        }, {
            name: 'arguement2',
            type: 'STRING',
            description: 'second poll option',
            required: true
        } , {
            name: 'arguement3',
            type: 'STRING',
            description: 'third poll option',
            required: false
        } , {
            name: 'arguement4',
            type: 'STRING',
            description: 'fourth poll option',
            required: false
        } , {
            name: 'arguement5',
            type: 'STRING',
            description: 'fifth poll option',
            required: false
        }
        ]
    }
}