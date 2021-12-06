//Call: $w
//This command simply runs the weather command
exports.run = (client,message,args) => {
    client.commands.get("weather").run(client, message, args);
}
