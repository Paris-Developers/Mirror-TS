//Call: Slash command s
//Returns the stock command
const { registerData } = require("./stock");

exports.commandName = 's';

exports.run = (client, interaction) => {
    client.commands.get("stock").run(client, interaction);
}

exports.registerData = (client) => {
    let data = registerData(client);
    data.name = this.commandName;
    return data;
} 