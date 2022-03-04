import { ApplicationCommandDataResolvable, CommandInteraction, CacheType, VoiceChannel, GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";

export let defaultVc = new Enmap('defaultVc');

export class DefaultVc implements SlashCommand{
    name: string = 'defaultvc'
    registerData: ApplicationCommandDataResolvable = {
        name: this.name,
        description: '[ADMIN ONLY] Set a default voice channel for Mirror to join upon restart, will not play a sound',
        options: [{
            name: 'channel',
            type: ApplicationCommandOptionTypes.CHANNEL,
            description: 'The channel you wish to designate as the default',
            required: true,
        }]
    };
    requiredPermissions: bigint[] = [];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        let member = interaction.member as GuildMember;
        if(!(interaction.channel instanceof TextChannel) || !member.permissionsIn(interaction.channel!).has('ADMINISTRATOR')) {
            interaction.reply({
                content:
                    'This command is only for people with Administrator permissions',
                ephemeral: true,
            });
        return;
        }
        let channel = interaction.options.getChannel('channel');
        if(!(channel instanceof VoiceChannel)){
            interaction.reply({
                content:'Channel must be a voice channel',
                ephemeral: true
            });
            return;
        }
        if(!interaction.guild?.me?.permissionsIn(channel.id).has('CONNECT')){
            interaction.reply({
                content:'I do not have permission to Connect to that VC',
                ephemeral: true
            });
            return;
        }
        if(!interaction.guild?.me?.permissionsIn(channel.id).has('SPEAK')){ //TODO: verify that this does anything
            interaction.reply({
                content:'I do not have permission to Speak in that VC',
                ephemeral: true
            });
            return;
        }
        if(!interaction.guild?.me?.permissionsIn(channel.id).has('VIEW_CHANNEL')){ //TODO: verify that this does anything
            interaction.reply({
                content:'I do not have permission to View that VC',
                ephemeral: true
            });
            return;
        }
        defaultVc.set(interaction.guild!.id,channel.id);
        let embed = new MessageEmbed()
            .setColor('#ffffff')
            .setDescription(`Sucessfully updated your default voice channel to ${channel}`);
        interaction.reply({embeds:[embed]});
        return;
    }
    //TODO: guildRequired? = true;
}