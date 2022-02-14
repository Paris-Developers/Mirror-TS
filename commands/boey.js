const { MessageEmbed, User } = require('discord.js');

exports.commandName = 'boey';

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Sends Boeys stream information!'
    }
}

exports.run = async (client,interaction) => {
    //TODO: Permission Check
    let boey = await client.users.fetch('331511682155282432');
    const embed = new MessageEmbed()
        .setColor('#6441a5')
        .setTitle(':otter: **__BOEY STREAM HERE__**')
        .setURL('https://www.twitch.tv/kanganya')
        .setDescription(':goat: Come watch mamas slay the competition <:power_cry:759835413296316496>')
        .setThumbnail(boey.displayAvatarURL());
    interaction.reply({embeds:[embed]});
    return;
}