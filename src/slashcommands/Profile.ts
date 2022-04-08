import { CommandInteraction, CacheType, MessageEmbed } from "discord.js";
import { Bot } from "../Bot";
import { colorCheck } from "../resources/embedColorCheck";
import { experienceAdd, userProfiles } from "../resources/experienceAdd";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";


export class Profile implements SlashCommand {
    name: string = 'profile';
    description: string = 'View your Mirror profile';
    options: (Option | Subcommand)[] = [];
    requiredPermissions: bigint[] = [];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            let user = interaction.user;
            let list = [];
            for(let rank of userProfiles){
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
            let rank = `${list.findIndex((element) => element[0] == user.id)+1} of ${list.length}`;
            
            let guild = bot.client.guilds.cache.get('938519232155648011');
            let inDev = false;
            if(guild?.members.fetch(user.id)) inDev = true;

            const embed = new MessageEmbed()
                .setTitle(`Mirror profile for ${user.username}`)
                .setColor(colorCheck(interaction.guild!.id))
                .addFields(
                    {
                        name:'Rank', 
                        value: rank
                    },
                    {
                        name: 'Development Server',
                        value: inDev ? 'Member!' : '[Not a member :(](https://discord.gg/uvdg2R5PAU)'
                });
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
export class UserProfile {
    //userID string
    user: string;
    xp: number;
    commandsUsed: number;
    lastCommandUsed: Date;
    firstCommandUsed: Date;
    rank?: number;

    constructor(user: string) {
        this.user = user;
        this.xp = 0;
        this.commandsUsed = 0;
        this.lastCommandUsed = new Date(Date.now());
        this.firstCommandUsed = new Date(Date.now())
    }

    
}