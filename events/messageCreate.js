module.exports = async (client, message) => {
    //ignore all bots
    if (message.author.bot) return;

    var prefix = client.config.prefix;

    //ignore messages not starting with the prefix (in config.json)
    console.log(message.content);
    if (message.content == '<:FortBush:816549663812485151>'){
        message.react(':FortBush:816549663812485151');
    }else if (message.content == '<:JamesChamp:791190997236842506>' || message.content == 'Pog' || message.content == 'pog'){
        message.react(':JamesChamp:791190997236842506');
    }else if (message.content.indexOf(prefix) !== 0) {
        return;
    }
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