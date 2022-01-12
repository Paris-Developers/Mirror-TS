//Checks an array of specified permissions for a messages channel, returns a boolean
exports.permissionsCheck =async (client, interaction, permissionsToCheck) => {
    let guildMember = await interaction.guild.members.fetch(client.user);
    let permissions = interaction.channel.permissionsFor(guildMember);
    permissionsToCheck.forEach(async (permission) => {
        if(!permissions.has(permission)) return false;
    })
    return true;
}
//Checks a single permission for a messages channel, returns a boolean
const permissionCheck = async (client, interaction, permission) => {
    let guildMember = await interaction.guild.members.fetch(client.user);
    let permissions = interaction.channel.permissionsFor(guildMember);
    return permissions.has(permission);
}
exports.permissionCheck = permissionCheck;