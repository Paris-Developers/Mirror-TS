exports.run = (client,message,args) => {
    client.commands.get("weather").run(client, message, args);
}
