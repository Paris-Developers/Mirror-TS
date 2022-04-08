import { ColorResolvable } from "discord.js";
import { serverColors } from "../slashcommands/ServerColor";

export function colorCheck(guildID: string, music?: boolean): ColorResolvable {
    let color = serverColors.get(guildID);
    if(!color){
        if(music) return'BLUE';
        return '#FFFFFF';
    }
    return color;
}   