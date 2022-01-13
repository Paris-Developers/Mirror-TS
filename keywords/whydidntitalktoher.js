//another one off the books
//man....
//what could have been
exports.keywordName = 'whydidntitalktoher';

exports.run = (client, message, args) => {
    message.react('🇲')
        .then(() => message.react('🇦'))
        .then(() => message.react('🇳'));
}