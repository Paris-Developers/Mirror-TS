//Supposed to react to a mirror emoji with a mirror emoji

exports.keywordName = 'whatthefuckhowdoitypeamirror';

exports.run = (client, message, args) => {
    message.react('🪞');
}