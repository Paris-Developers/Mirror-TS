//https://dashboard.cryptoapis.io/account/plans
const {MessageEmbed} = require('discord.js');
var https = require("https");

exports.commandName = 'crypto';

exports.run = async (client, message, args) => {
    let ticker = args[0];
    var options = {
        "method" : "GET",
        "hostname": "rest.cryptoapis.io",
        "path" : `/v2/market-data/assets/BTC`,
        "qs" : [],
        "headers": {
            "Content-Type" : "application/json",
            "X-API-Key" : client.config.crypto_token
        }
    }
    var req = https.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function(){
            var body = Buffer.concat(chunks);
            console.log(body.toString());
        });
    });
    req.end();
}