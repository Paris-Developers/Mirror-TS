//Call: $w

const { registerData } = require("./weather");

//This command simply runs the weather command
exports.commandName = 'w';

exports.run = (client, interaction) => {
    client.commands.get("weather").run(client, interaction);
}

exports.registerData = (client) => {
    let data = registerData(client);
    data.name = this.commandName;
    return data;
} 
