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
import { Subcommand, Option } from "./Option";

export class Tickle implements SlashCommand {
    name: string = 'tickle';
    description = 'Get tickled';
    options: (Option | Subcommand)[] = [   
        new Option(
            'user',
            'The user to tickle',
            ApplicationCommandOptionTypes.USER,
            false
        ),
    ];
    requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
    async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {

        try {
        let res = await fetch(`https://nekos.best/api/v1/tickle`);
        let jsonData = await res.json();
        console.log(jsonData);
        let tickleEmbed = new MessageEmbed().setColor('RANDOM').setImage(jsonData.url).setTitle(jsonData.anime_name);
        if (interaction.options.getUser('user')) {
            tickleEmbed.setDescription(`${interaction.user} tickled ${interaction.options.getUser('user')}`);
        }
        
        interaction.reply({embeds: [tickleEmbed] });
            } catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			    });
            }
    }
    /*
    guildRequired?: boolean | undefined;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
*/
}