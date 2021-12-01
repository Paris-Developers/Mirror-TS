module.exports = async (client, message) => {
    //ignore all bots
    if (message.author.bot) return;

    var prefix = client.config.prefix;

    //check for prefix to determine if command or not
    let isCommand = message.content.indexOf(prefix) == 0;

    //parse out arguments and get the base command name
    let args = message.content.trim().split(/ +/g);
    
    //ternary operator -> checks to see if expression before ? is true, if true, use expression left of colon, if false, use expression right of colon
    const command = isCommand ? args[0].slice(prefix.length).toLowerCase() : args[0].toLowerCase(); //if it's a command we need to slice out the prefix
    args.shift(); //remove the first argument because we won't need to pass the command/keyword name to the triggered function
    const cmd = isCommand ? client.commands.get(command) : client.keywords.get(command); //if it's a command, get it from command enmap, otherwise check keyword enmap

    //if the command/keyword doesn't exist, just exit
    if (!cmd) return;

    //run command/keyword
    cmd.run(client, message, args);
}