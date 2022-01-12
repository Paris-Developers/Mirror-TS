//$react
//Currently broken, will need to be fixed in upcoming bug fixing. Currently attempting to respond to the addition of an emoji on their first call to $react

//NOT CONVERTED TO SLASH COMMANDS BECAUSE ITS UNFINISHED

// const { Message } = require("discord.js");

// exports.commandName = 'react';

// exports.run = async (client, message, args) => {
//     //message.channel.send('Hey lol');
//     //const reactionEmoji = client.emojis.cache.get();
//     //message.react(':FortBush:816549663812485151');
//     //message.react(':JamesChamp:791190997236842506');


//     //Testing out sample code
//     message.react('👍').then(() => message.react('👎'));

//     const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));

//     const filter = (reaction, user) => {
// 	    return ['👍', '👎'].includes(reaction.emoji.name);
//     };

//     message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
// 	.then(collected => {
// 	    const reaction = collected.first();
// 	    if (reaction.emoji.name === '👍') {
// 		    message.reply('You reacted with a thumbs up.');
// 	    } else {
// 		    message.reply('You reacted with a thumbs down.');
// 	    }
//     })
//     .catch(collected => {
// 	    message.reply('You reacted with neither a thumbs up, nor a thumbs down.');
//     });
// }
