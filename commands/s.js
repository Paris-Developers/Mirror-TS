//Call: $s

const { registerData } = require("./stock");

//This command simply runs the stock command
exports.commandName = 's';

exports.run = (client, interaction) => {
    client.commands.get("stock").run(client, interaction);
}

exports.registerData = registerData;