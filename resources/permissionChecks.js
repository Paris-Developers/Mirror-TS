//Checks an array of specified permissions for a messages channel, returns a boolean
exports.permissionsCheck = async (client, interaction, permissionsToCheck) => {
    if(!interaction.guild) return true;
    await interaction.guild.fetch();
    let guildMember = await interaction.guild.members.fetch(client.user);
    let permissions = interaction.channel.permissionsFor(guildMember);
    for(let permission of permissionsToCheck){
        if(!permissions.has(permission)) return false;
    }
    return true;
}
//Checks a single permission for a messages channel, returns a boolean
const permissionCheck = async (client, interaction, permission) => {
    if(!interaction.guild) return true;
    await interaction.guild.fetch();
    let guildMember = await interaction.guild.members.fetch(client.user);
    let permissions = interaction.channel.permissionsFor(guildMember);
    return permissions.has(permission);
}
exports.permissionCheck = permissionCheck;``