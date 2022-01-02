//Call: $w

const { registerData } = require("./weather");

//This command simply runs the weather command
exports.commandName = 'w';

exports.run = (client, interaction) => {
    client.commands.get("weather").run(client, interaction);
}

exports.registerData = registerData;
