//Call: $help
//forwards the Info command
const {registerData} = require('./info.js')
exports.commandName = 'help';

exports.run = (client,interaction) => {
    client.commands.get("info").run(client,interaction);
}

exports.registerData = registerData;