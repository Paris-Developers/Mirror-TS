module.exports = async (client, message) => {
    //ignore all bots
    if (message.author.bot) return;

    //ignore messages not starting with the prefix (in config.json)
    if (message.content.indexOf(prefix) !== 0) return;

    //parse out arguments and get the base command name
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

    //grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);

    //if the command doesn't exist, just exit
    if (!cmd) return;

    //run command
    cmd.run(client, message, args);

}