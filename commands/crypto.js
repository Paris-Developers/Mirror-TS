//https://dashboard.cryptoapis.io/account/plans
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'crypto';
	
exports.run = async (client, message, args) => {
    //plan does not support this endpoint.
    headers = {
        "Content-Type" : "application/json",
        "X-API-Key" : client.config.crypto_token
    }
    let res = await fetch(`https://rest.cryptoapis.io/v2/market-data/assets/BTC`, { headers });
    let jsonData = await res.json();
    console.log(jsonData);

}