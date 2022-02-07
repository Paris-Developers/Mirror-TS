exports.commandName = 'birthday';

exports.run = async (client, interaction) => {
    //test
    interaction.reply('placeholder');
    return;
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Set your birthday to recieve a Birthday message on your birthday!',
    }
}