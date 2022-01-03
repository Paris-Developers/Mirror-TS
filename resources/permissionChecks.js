//Checks an array of specified permissions for a messages channel, returns a boolean
exports.permissionsCheck =async (client,message,permissionsToCheck) => {
    let guildMember = await message.guild.members.fetch(client.user);
    let permissions = message.channel.permissionsFor(guildMember);
    permissionsToCheck.forEach(async (permission) => {
        if(!permissions.has(permission)) return false;
    })
    return true;
}
//Checks a single permission for a messages channel, returns a boolean
const permissionCheck = async (client, message,permission) => {
    let guildMember = await message.guild.members.fetch(client.user);
    let permissions = message.channel.permissionsFor(guildMember);
    return permissions.has(permission);
}
exports.permissionCheck = permissionCheck;