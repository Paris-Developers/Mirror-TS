const { Permissions } = require('discord.js');

exports.commandName = 'support';


exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Join Mirrors public support server'
    }
};

exports.run = async (client, interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }
    interaction.reply('discord.gg/uvdg2R5PAU');
    return;

    //TODO Error Handling
}