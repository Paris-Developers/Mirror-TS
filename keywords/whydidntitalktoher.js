//another one off the books
exports.run = (client, message, args) => {
    message.react('🇲')
        .then(() => message.react('🇦'))
        .then(() => message.react('🇳'));
}