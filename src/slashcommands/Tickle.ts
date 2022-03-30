//Call: Slash command Tickle
// Returns a tickle
import { ApplicationCommandDataResolvable,
    CommandInteraction,
    CacheType,
    Permissions,
    MessageEmbed,
    Application,
    ApplicationCommand
} from "discord.js";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";
import fetch from "node-fetch";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

export class Tickle implements SlashCommand {
    name: string = 'tickle';
    registerData: ApplicationCommandDataResolvable = {
        name: this.name,
        description: 'Get tickled',
        options: [{name: 'user',
        description: 'Tickle a user',
        type: ApplicationCommandOptionTypes.USER,
        required: false}]
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
        if (interaction.options.getUser('user')) {
            tickleEmbed.setDescription(`${interaction.user} tickled ${interaction.options.getUser('user')}`);
        }
        
        interaction.reply({embeds: [tickleEmbed] });
        


    }
    /*
    guildRequired?: boolean | undefined;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
*/
}