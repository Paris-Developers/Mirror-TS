exports.commandName = 'cringe';

exports.run = async (client, message, args) => {
    if(!(await client.msgPermsCheck(client,message,[Permissions.FLAGS.SEND_MESSAGES,Permissions.FLAGS.EMBED_LINKS]))){
        console.log(`Missing permissions to use ${this.commandName} in channel: ${message.channel.name}, in guild: ${message.guild.name}`);
        return;
    }
    message.reply('🕴️');
    return;
}