//Call: Slash command n
//Returns the news command
const { registerData } = require("./news.js");

exports.commandName = 'n';

exports.run = (client,interaction) => {
    client.commands.get("news").run(client, interaction);
}

exports.registerData = (client) => {
    let data = registerData(client);
    data.name = this.commandName;
    return data;
} 