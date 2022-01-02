//Call: $n
//This command simply runs the news command

const { registerData } = require("./news.js");
exports.commandName = 'n';

exports.run = (client,interaction) => {
    client.commands.get("news").run(client, interaction);
}

exports.registerData = registerData;