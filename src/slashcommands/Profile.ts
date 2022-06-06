import { CommandInteraction, CacheType, MessageEmbed } from "discord.js";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { colorCheck } from "../resources/embedColorCheck";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";

export const profiles = new Enmap('Profiles');

export class Profile implements SlashCommand {
    name: string = 'profile';
    description: string = 'View your Mirror profile';
    options: (Option | Subcommand)[] = [];
    requiredPermissions: bigint[] = [];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            let userProfile = profiles.get(interaction.user.id) as UserProfile;
            const embed = new MessageEmbed()
                .setTitle(`Mirror profile for ${interaction.user.username}`)
                .setColor(colorCheck(interaction.guild!.id))
                .addFields({
                    name: 'User Level',
                    value: `${userProfile.xp >100 ? Math.floor(Math.log(userProfile.xp/100) / Math.log(2)) + 2: 1}`,
                    inline: true,
                },{
                    name: 'Messages',
                    value: `Messages sent: ${userProfile.messagesSent},
                            First Message: ${userProfile.firstMessageSent?.getDate()},
                            Last Message: ${userProfile.lastMessageSent?.getDate()}`,
                    inline: true
                },{
                    name: 'Commands',
                    value: `Commands Used: ${userProfile.commandsUsed},
                            First Message: ${userProfile.firstCommandUsed?.getDate()},
                            Last Message: ${userProfile.lastCommandUsed?.getDate()}`,
                    inline: true
                });
            if(interaction.guild){
                var guildData = userProfile.guildData.get(interaction.guild.id) as GuildData;
                embed.addFields({
                    name: 'Guild Level',
                    value: `${userProfile.xp >100 ? Math.floor(Math.log(userProfile.xp/100) / Math.log(2)) + 2: 1}`,
                    inline: true,
                },{
                    name: 'Guild Messages',
                    value: `Messages sent: ${guildData.messagesSent},
                            First Message: ${guildData.firstMessage?.getHours()}:${guildData.firstMessage?.getMinutes()} ${guildData.firstMessage?.getMonth()}-${guildData.firstMessage?.getDate()},
                            Last Message: ${guildData.lastMessage?.getDate()}`,
                    inline: true
                },{
                    name: 'Guild Commands',
                    value: `Commands Used: ${guildData.commandsUsed},
                            First Message: ${guildData.firstCommand?.getDate()},
                            Last Message: ${guildData.lastCommand?.getDate()}`,
                    inline: true
                })  
            }
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
    user: string;
    xp: number;
    guildData: Enmap;
    commandsUsed: number;
    lastCommandUsed?: Date;
    firstCommandUsed?: Date;
    messagesSent: number;
    firstMessageSent?: Date;
    lastMessageSent?: Date;

    constructor(user: string) {
        this.user = user;
        this.xp = 0;
        this.guildData = new Enmap(`guild${user}`);
        this.commandsUsed = 0;
        this.messagesSent = 0;

    }
}
export class GuildData {
    guild: string;
    xp: number;
    commandsUsed: number;
    firstCommand?: Date;
    lastCommand?: Date;
    messagesSent: number;
    firstMessage?: Date;
    lastMessage?: Date;

    constructor(guild: string){
        this.guild = guild;
        this.xp = 0;
        this.commandsUsed = 0;
        this.messagesSent = 0;
    }
}

export function interactionXP(userString: string, guild?: string){
    var userProfile = profiles.get(userString) as UserProfile;
    if(!userProfile) userProfile = new UserProfile(userString);
    var xp;
    var now = new Date();
    if(!userProfile.lastCommandUsed) xp = 100;
    else if(userProfile.lastCommandUsed.getDate() != now.getDate()) xp = 50;
    else if(userProfile.lastCommandUsed.getHours() != now.getHours()) xp = 25;
    else if(userProfile.lastCommandUsed.getMinutes() != now.getMinutes()) xp = 10;
    else xp = 1;
    userProfile.xp += xp;
    userProfile.commandsUsed += 1;
    userProfile.lastCommandUsed = new Date();
    if(!userProfile.firstCommandUsed) userProfile.firstCommandUsed = new Date();
    if(guild){
        var guildProfile = userProfile.guildData.get(guild) as GuildData;
        if(!guildProfile) guildProfile = new GuildData(guild);
        guildProfile.xp += xp;
        guildProfile.commandsUsed += 1;
        guildProfile.lastCommand = new Date();
        if(!guildProfile.firstCommand) guildProfile.firstCommand = new Date();
        userProfile.guildData.set(guild, guildProfile);
    }
    profiles.set(userString, userProfile);
    return;
}

export function messageXP(userString: string, guild?: string){
    var userProfile = profiles.get(userString) as UserProfile;
    if(!userProfile) userProfile = new UserProfile(userString);
    var xp;
    var now = new Date();
    if(!userProfile.lastMessageSent) xp = 10;
    else if(userProfile.lastMessageSent.getDate() != now.getDate()) xp = 5;
    else if(userProfile.lastMessageSent.getHours() != now.getHours()) xp = 2;
    else xp = 1;
    userProfile.xp += xp;
    userProfile.messagesSent += 1;
    userProfile.lastMessageSent = new Date();
    if(!userProfile.firstMessageSent) userProfile.firstMessageSent = new Date();
    if(guild){
        var guildProfile = userProfile.guildData.get(guild) as GuildData;
        if(!guildProfile) guildProfile = new GuildData(guild);
        guildProfile.xp += xp;
        guildProfile.messagesSent += 1;
        guildProfile.lastMessage = new Date();
        if(!guildProfile.firstMessage) guildProfile.firstMessage = new Date();
        userProfile.guildData.set(guild, guildProfile);
    }
    profiles.set(userString, userProfile);
    return;
}

