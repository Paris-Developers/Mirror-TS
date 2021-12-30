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
            "X-API-Key" : "8d8ce8fb1c296142dd800a8fa9cc642b23aa219b"
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
    req.end()
}