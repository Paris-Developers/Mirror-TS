import { ColorResolvable } from "discord.js";
import { serverColors } from "../slashcommands/ServerColor";

export function colorCheck(guildID: string, music?: boolean): ColorResolvable {
    let color = serverColors.get(guildID);
    if(!color){
        if(music) return 'Blue';
        return '#FFFFFF';
    }
    return normalizeColor(color);
}

// discord.js v13 color names were 'DARK_BLUE' style; v14 expects 'DarkBlue'. Servers may still have v13 names saved.
export function normalizeColor(color: string): ColorResolvable {
    if (!/^[A-Z_]+$/.test(color)) return color as ColorResolvable;
    return color.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join('') as ColorResolvable;
}