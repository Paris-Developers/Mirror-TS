//test reaction to a custom emoji which we cannot make a file name for
//not working for some reason smile
exports.keywordName = '<:fortbush:816549663812485151>'

exports.run = (client, message, args) => {
    message.react(':FortBush:816549663812485151');
}