exports.run = (client,message,args) => {
    client.commands.get("news").run(client, message, args);
}
