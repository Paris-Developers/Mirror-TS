exports.keywordName = 'keywordtest';

exports.run = (client, message, args) => {
    message.reply(`Hello keyword user: ${message.author.username}`);
}