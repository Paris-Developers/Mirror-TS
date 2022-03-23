import { ApplicationCommandDataResolvable, CommandInteraction, CacheType, Permissions, MessageEmbed} from "discord.js";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";
import fetch from "node-fetch";

export class Tickle implements SlashCommand {
    name: string = 'tickle';
    registerData: ApplicationCommandDataResolvable = {
        name: this.name,
        description: 'Get tickled',
    };
    requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        //throw new Error("Method not implemented.");
        //interaction.reply('Test');

        let res = await fetch(`https://nekos.best/api/v1/tickle`);
        let jsonData = await res.json();
        console.log(jsonData);
        let tickleEmbed = new MessageEmbed().setColor('RANDOM').setImage(jsonData.url).setTitle(jsonData.anime_name);
        interaction.reply({embeds: [tickleEmbed] });
        


    }
    /*
    guildRequired?: boolean | undefined;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
*/
}