import { CommandInteraction, CacheType, EmbedBuilder, ColorResolvable } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";

export const serverColors = new Enmap('serverColors');

export class ServerColor implements SlashCommand {
    name: string = 'servercolor';
    description: string = '[MANAGER] Set the color to be used in Mirror message embeds';
    options: (Option | Subcommand)[] = [
        new Option(
            'color',
            'The color you want to set',
            ApplicationCommandOptionTypes.STRING,
            true,
        )
    ]
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            let color = interaction.options.getString('color')?.toUpperCase();
            try{
                var colorTest = color as ColorResolvable;

                const embed = new EmbedBuilder()
                    .setColor(colorTest)
                    .setDescription('This is your new server color!');
                serverColors.set(interaction.guild!.id, colorTest);
                return interaction.reply({embeds: [embed]});
            } catch (err){
                return interaction.reply({content: 'Invalid color, please try again with format: \'#ABC123\' or BLUE or RANDOM'});
            }
        } catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			
		}
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined = true;
    blockSilenced?: boolean | undefined;
    musicCommand?: boolean | undefined;
    
}