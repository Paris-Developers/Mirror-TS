// //https://dashboard.cryptoapis.io/account/plans
// const {MessageEmbed} = require('discord.js');
// const fetch = require('node-fetch');

// exports.commandName = 'crypto';
	
// exports.run = async (client, interaction) => {
//     //plan does not support this endpoint.
//     headers = {
//         "Content-Type" : "application/json",
//         "X-API-Key" : client.config.crypto_token
//     }
//     let res = await fetch(`https://rest.cryptoapis.io/v2/market-data/assets/BTC`, { headers });
//     let jsonData = await res.json();
//     console.log(jsonData);
//     interaction.reply('Crypto finished');
// }


// exports.registerData = (client) => {
//     return {
//         name: this.commandName,
//         description: 'Get crypto data',
//     }
// };