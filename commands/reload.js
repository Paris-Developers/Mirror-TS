//Call: Slash command reload
//Reloads the file for a specified command
//Only the config.owner can use this command
const { Permissions } = require('discord.js');

exports.commandName = 'reload';

exports.run = async (client, interaction) => {
    if(!(await client.permissionCheck(client,interaction,Permissions.FLAGS.SEND_MESSAGES))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    const commandName = interaction.options.getString('command');

    if (!client.commands.has(commandName) && !client.keywords.has(commandName)) { //neither enmap has it so just exit
        return interaction.reply(`Could not find command or keyword ${commandName}`);
    }

    if (client.commands.has(commandName)){
        delete require.cache[require.resolve(`./${commandName}.js`)]; //make sure the cache is cleared
        client.commands.delete(commandName); //delete the function from the enmap
        const props = require(`./${commandName}.js`); //get the new version of the function
        client.commands.set(commandName, props); //assign the new version to the enmap
        interaction.reply(`Reloaded command ${commandName}`);
    }

    if (client.keywords.has(commandName)) { //exact same as above with different folder and enmap
        delete require.cache[require.resolve(`../keywords/${commandName}.js`)];
        client.keywords.delete(commandName);
        const props = require(`../keywords/${commandName}.js`);
        client.keywords.set(commandName, props);
        interaction.reply(`Reloaded keyword ${commandName}`);
    }
}
exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Reloads a command',
        options: [{
            name: 'command',
            type: 'STRING',
            description: 'command to reload',
            required: true
        }],
        permissions: [{
            id: client.config.owner,
            type: 'USER',
            permission: true
        }],
    }
};
