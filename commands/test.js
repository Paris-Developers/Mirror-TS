exports.commandName = 'test';

exports.run = (client, message, args) => {
    message.reply(`Hello ${message.author.username}`);
}