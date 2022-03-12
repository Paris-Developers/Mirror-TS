import { ApplicationCommandDataResolvable, CommandInteraction, CacheType, Role, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";
import { managerRoles } from "./ManagerRole";

const silencedRole = new Enmap('SilencedRole');

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
            let currentRole =  silencedRole.get(interaction.guild!.id);
            currentRole = interaction.guild?.roles.cache.get(currentRole);
            const embed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setDescription(`Replaced role ${currentRole} with ${badRole} as silenced role.  Anyone with this role will not be able to interact with Birtdhays, Introthemes or Music Commands.`);
            return interaction.reply({embeds:[embed]})


        } catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}

        throw new Error("Method not implemented.");
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined = true;
    
}