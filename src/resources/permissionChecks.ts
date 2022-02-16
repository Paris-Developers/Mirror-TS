//Checks an array of specified permissions for a messages channel, returns a boolean
import { Client, Interaction, TextChannel, GuildMember } from 'discord.js';


//Permissions.FLAGS properties are all bigints, thus we take an array of them for permissionsToCheck
export async function permissionsCheck(client: Client, interaction: Interaction, permissionsToCheck: Array<bigint>): Promise<boolean> {
    if(!interaction.guild) return true;
    await interaction.guild.fetch();
    if (!(interaction.channel instanceof TextChannel)) return true; //we only need to care about permissions in guild text channels
    let guildMember = await interaction.guild.members.fetch(client.user!);
    let permissions = interaction.channel.permissionsFor(guildMember);
    for(let permission of permissionsToCheck){
        if(!permissions.has(permission)) return false;
    }
    return true;
}