import { CommandInteraction, CacheType, MessageEmbed } from "discord.js";
import { Bot } from "../Bot";
import { colorCheck } from "../resources/embedColorCheck";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";
import { experience } from "../resources/experienceAdd";

export class Profile implements SlashCommand {
    name: string = 'profile';
    description: string = 'View your Mirror profile';
    options: (Option | Subcommand)[] = [];
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            let user = interaction.user;
            let list = [];
            for(let rank of experience){
                list.push(rank);
            }
            var propRetrive = function(obj: { xp: number; }[]) {
                return obj[1].xp;
            }

            var sort = function(propertyRetriever : any, arr : any[]) {
                arr.sort(function (a,b) {
                    var valueA = propertyRetriever(a);
                    var valueB = propertyRetriever(b);
                    if (valueA < valueB) {
                        return -1;
                    } 
                    if (valueA > valueB) {
                        return 1;
                    }
                    return 0;
                })
                return arr;
            }
            list = sort(propRetrive,list);
            console.log(list);
            


            console.log(user.avatarURL());
            const embed = new MessageEmbed()
                .setTitle(`Mirror profile for ${user.username}`)
                .setColor(colorCheck(interaction.guild!.id));
            if(user.avatarURL()) embed.setThumbnail(user.avatarURL()!);
            else embed.setThumbnail(user.defaultAvatarURL);
            return interaction.reply({embeds: [embed]});
        } catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				ephemeral: true,
			});
		}
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
    musicCommand?: boolean | undefined;

} 