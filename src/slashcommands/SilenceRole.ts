import { ApplicationCommandDataResolvable, CommandInteraction, CacheType, Role, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";
import { managerRoles } from "./ManagerRole";

export const silencedRole = new Enmap('SilencedRole');

export class SilenceRole implements SlashCommand {
    name: string = 'silencerole';
    registerData: ApplicationCommandDataResolvable = {
        name: this.name,
        description: '[MANAGER] Set a role from using Birthday, Intro, or Music commands.',
        options: [{
            name: 'role',
            description: 'The role to silence.',
            type: ApplicationCommandOptionTypes.ROLE,
            required: true,
        }]
    }
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            let badRole = interaction.options.getRole('role') as Role;
            if(badRole?.permissionsIn(interaction.channel!.id).has('ADMINISTRATOR')){
                return interaction.reply({content: 'Roles with administrator permissions cannot be silenced!'});
            }
            let managedRoles = managerRoles.ensure(interaction.guild!.id,[]);
            for(let role of managedRoles){
                if(role == badRole?.id){
                    return interaction.reply({content: 'Manager Roles cannot be silenced!', ephemeral:true});
                }
            }
            let currentRole =  silencedRole.get(interaction.guild!.id) as string;
            silencedRole.set(interaction.guild!.id, badRole?.id);
            if(currentRole && currentRole != badRole.id){
                let getRole = interaction.guild?.roles.cache.get(currentRole);
                const embed = new MessageEmbed()
                    .setColor('#FFFFFF')
                    .setDescription(`Replaced role ${getRole} with ${badRole} as silenced role.  Members with this role will not be able to interact with Birthdays, Introthemes or Music Commands.`);
                return interaction.reply({embeds:[embed]});
            }
            const embed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setDescription(`Set ${badRole} as silenced, members with this role will not be able to react with Birthdays, Introthemes, and Music Commands`);
                return interaction.reply({embeds:[embed]});
        } catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined = true;
    
}