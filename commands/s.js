//Call: $s
//This command simply runs the stock command

exports.commandName = 's';

exports.run = (client,message,args) => {
    client.commands.get("stock").run(client, message, args);
}
