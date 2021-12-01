exports.run = (client, message, args) => {
    if (message.author.id == client.config.owner) {
        if(!args || args.size < 1) return message.reply("Must provide a command/keyword name to reload.");
        const commandName = args[0];
        // Check if the command exists and is valid
        if(client.commands.has(commandName)) {
            // the path is relative to the *current folder*, so just ./filename.js
            delete require.cache[require.resolve(`./${commandName}.js`)];
            // We also need to delete and reload the command from the client.commands Enmap
            client.commands.delete(commandName);
            const props = require(`./${commandName}.js`);
            client.commands.set(commandName, props);
            message.reply(`The command ${commandName} has been reloaded`);
        } else if (client.keywords.has(commandName)) { //we should also check keywords, but since it uses a different enmap, another code block is (probably) the easiest way
            // the path is relative to the *current folder*, so remap to keywords
            delete require.cache[require.resolve(`../keywords/${commandName}.js`)];
            // We also need to delete and reload the keyword from the client.keywords Enmap
            client.keywords.delete(commandName);
            const props = require(`../keywords/${commandName}.js`);
            client.keywords.set(commandName, props);
            message.reply(`The keyword ${commandName} has been reloaded`);
        } else {
            message.reply(`Could not find command/keyword ${commandName}`);
        }
    }
}