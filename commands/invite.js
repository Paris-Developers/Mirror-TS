const { MessageEmbed,Permissions } = require('discord.js');

exports.commandName = 'invite';

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Invite link for Mirror'
    }
};

exports.run = async (client, interaction) => {
    if(!(await client.permissionsCheck(client,interaction,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
        return;
    }

    const embed = new MessageEmbed()
        .setTitle('**__Invite Mirror__**')
        .setDescription('Want to invite Mirror to your own server? Click the link above.')
        .setThumbnail('https://imgur.com/nXf9JGG.jpg')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=0&scope=bot%20applications.commands')
        .setFooter('Created in 2021, by Fordle#0001 and Phantasm#0001');
    interaction.reply({embeds:[embed]});
    return;

    //TODO Error Handling
}