exports.commandName = 'roles';
const { DataManager } = require('discord.js');

exports.run = async (client, interaction) => {
    let array = [];
    interaction.member.roles.forEach(role => array.push(role.name, role.id));
    interaction.reply(array);

}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'return a users roles',
    }
};