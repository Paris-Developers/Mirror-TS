//Call: $help
//forwards the Info command

exports.run = (client,message,args) => {
    client.commands.get("info").run(client,message,args);
}