//Supposed to react to a mirror emoji with a mirror emoji

exports.keywordName = '🪞';

exports.run = (client, message, args) => {
    message.react('🪞');
}
