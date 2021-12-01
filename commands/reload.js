exports.run = (client, message, args) => {
    if (message.author.id == client.config.owner) {
        if(!args || args.size < 1) return message.reply("Must provide a command/keyword name to reload.");
        const commandName = args[0];

        if (!client.commands.has(commandName) && !client.keywords.has(commandName)) { //neither enmap has it, not valid
            return message.reply(`Could not find command/keyword ${commandName}`);
        }

        const isCommand = client.commands.has(commandName); //whether we're dealing with a command or keyword
        const pathToFile = isCommand ? `./${commandName}.js` : `../keywords/${commandName}.js` // if it's a keyword we need to remap to keyword directory
        delete require.cache[require.resolve(pathToFile)]; //remove from cache
        const enmapName = isCommand ? 'commands' : 'keywords'; //we need to use the correct enmap
        client[enmapName].delete(commandName); //remove the current version
        const props = require(pathToFile); //get the new version
        client[enmapName].set(commandName, props); //set it to the correct enmap
        message.reply(`Reloaded the ${enmapName.slice(0, -1)} ${commandName}`);
    }
}