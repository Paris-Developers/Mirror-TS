import { DiscordGatewayAdapterCreator, joinVoiceChannel } from "@discordjs/voice";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { transpileModule } from "typescript";
import { Bot } from "../Bot";
import { colorCheck } from "./embedColorCheck";

export function voiceCommandCheck(bot: Bot, interaction: CommandInteraction): boolean {
    let member = interaction.member as GuildMember;
    let state = member.voice.channel;
    var embed = new MessageEmbed().setColor(colorCheck(interaction.guild!.id,true));

    //if user is not connected
    if (!state) {
        embed.setDescription('You are not connected to a voice channel!');
        interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }

    //if mirror is not connected to voice
    if (!interaction.guild!.me?.voice.channel) {
        const cmdCatches = ["play","playNext","join","sicko"];
        if(cmdCatches.includes(interaction.commandName)){
            joinVoiceChannel({
                channelId: state.id!,
                guildId: interaction.guildId!,
                adapterCreator: interaction.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator, 
            });
        } else {
            embed.setDescription(
                'Mirror is not connected to a voice channel, use `/join`'
            );
            interaction.reply({ embeds: [embed], ephemeral: true });
            return false;
        }
    }
    //if the user is not connected to the correct voice, end
    else if (interaction.guild!.me?.voice.channel!.id != state.id) {
        embed.setDescription(
            'Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call'
        );
        interaction.reply({ embeds: [embed], ephemeral: true });
        return false;
    }
    return true;
}