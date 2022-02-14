//Call: Slash command w
//Returns the weather command
const { registerData } = require("./weather");

exports.commandName = 'w';

exports.registerData = (client) => {
    let data = registerData(client);
    data.name = this.commandName;
    return data;
} 


exports.run = (client, interaction) => {
    client.commands.get("weather").run(client, interaction);
}

