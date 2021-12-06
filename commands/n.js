//Call: $n
//This command simply runs the news command
exports.run = (client,message,args) => {
    client.commands.get("news").run(client, message, args);
}
