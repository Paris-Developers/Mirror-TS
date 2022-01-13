//Keyword: mirror
//Reacts to the keyword with the eyes emoji
exports.keywordName = 'mirror';

exports.run = (client, message, args) => {
    message.react('👀');
}