import { ChatInputCommandInteraction, GuildMember, EmbedBuilder, MessageFlags } from "discord.js";
import { Bot } from "../Bot";
import { colorCheck } from "./embedColorCheck";

//these commands join the caller's channel themselves, so Mirror doesn't have to be connected yet
const connectsItself = ["play", "playnext", "join", "sicko", "munch"];

export function voiceCommandCheck(bot: Bot, interaction: ChatInputCommandInteraction): boolean {
    let member = interaction.member as GuildMember;
    let state = member.voice.channel;
    var embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

    //if user is not connected
    if (!state) {
        embed.setDescription('You are not connected to a voice channel!');
        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return false;
    }

    //if mirror is not connected to voice
    if (!interaction.guild!.members.me?.voice.channel) {
        if (connectsItself.includes(interaction.commandName)) return true;
        embed.setDescription(
            'Mirror is not connected to a voice channel, use `/join`'
        );
        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return false;
    }
    //if the user is not connected to the correct voice, end
    else if (interaction.guild!.members.me?.voice.channel!.id != state.id) {
        embed.setDescription(
            'Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call'
        );
        interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return false;
    }
    return true;
}
