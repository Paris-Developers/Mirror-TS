import { ChatInputCommandInteraction, GuildMember, EmbedBuilder } from "discord.js";
import { Bot } from "../Bot";
import { colorCheck } from "./embedColorCheck";
import { queueBusy } from "./CustomPlayer";
import { respond } from "./respond";

//these commands join the caller's channel themselves, so Mirror doesn't have to be connected yet.
//they can also bring Mirror over from another channel, as long as no music is playing there
const connectsItself = ["play", "playnext", "join", "sicko", "munch"];
//this one clears out a stuck player, so it works even when Mirror has already dropped out of voice
const cleansUp = ["destroyqueue"];

export async function voiceCommandCheck(bot: Bot, interaction: ChatInputCommandInteraction): Promise<boolean> {
    let member = interaction.member as GuildMember;
    let state = member.voice.channel;
    var embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));
    const refuse = async (description: string) => {
        embed.setDescription(description);
        await respond(interaction, { embeds: [embed] });
        return false;
    };

    //if user is not connected
    if (!state) return refuse('You are not connected to a voice channel!');

    const name = interaction.commandName;
    const mirrorChannel = interaction.guild!.members.me?.voice.channelId;
    //if mirror is not connected to voice
    if (!mirrorChannel) {
        if (connectsItself.includes(name) || cleansUp.includes(name)) return true;
        return refuse('Mirror is not connected to a voice channel, use `/join`');
    }
    //if the user is not connected to the correct voice
    if (mirrorChannel != state.id) {
        const busy = queueBusy(bot.player.nodes.get(interaction.guild!.id));
        if (connectsItself.includes(name) && !busy) return true;
        return refuse(
            busy
                ? `Mirror is playing music in <#${mirrorChannel}>. Join that channel to use voice commands.`
                : `Mirror is sitting in <#${mirrorChannel}>. Join it there, or use \`/join\` to bring it to your channel.`
        );
    }
    return true;
}
