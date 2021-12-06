//Call: $s
//This command simply runs the stock command
exports.run = (client,message,args) => {
    client.commands.get("stock").run(client, message, args);
}
