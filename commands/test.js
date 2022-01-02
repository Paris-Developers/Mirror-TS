exports.commandName = 'test';

exports.run = (client, interaction) => {
    interaction.reply(`Hello ${interaction.user.username}`);
}

exports.registerData = {
    name: this.commandName,
    description: 'Replies with your name!',
};