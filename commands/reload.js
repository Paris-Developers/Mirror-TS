exports.run = (client, message, args) => {
    if (message.author.id == client.config.owner) {
        if(!args || args.size < 1) return message.reply("Must provide a command/keyword name to reload.");
        const commandName = args[0];

        if (!client.commands.has(commandName) && !client.keywords.has(commandName)) { //neither enmap has it so just exit
            return message.reply(`Could not find command or keyword ${commandName}`);
        }

        if (client.commands.has(commandName)){
            delete require.cache[require.resolve(`./${commandName}.js`)]; //make sure the cache is cleared
            client.commands.delete(commandName); //delete the function from the enmap
            const props = require(`./${commandName}.js`); //get the new version of the function
            client.commands.set(commandName, props); //assign the new version to the enmap
            message.channel.send(`Reloaded command ${commandName}`);
        }

        if (client.keywords.has(commandName)) { //exact same as above with different folder and enmap
            delete require.cache[require.resolve(`../keywords/${commandName}.js`)];
            client.keywords.delete(commandName);
            const props = require(`../keywords/${commandName}.js`);
            client.keywords.set(commandName, props);
            message.channel.send(`Reloaded keyword ${commandName}`);
        }
       
    }
}