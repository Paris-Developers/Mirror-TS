import { CommandInteraction, CacheType, MessageEmbed, ColorResolvable } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Bot } from "../Bot";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";

export class ServerColor implements SlashCommand {
    name: string = 'servercolor';
    description: string = '[MANAGER] Set the servers color to be used in other Arrays';
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
            let color = interaction.options.getString('color');
            let colorTest = color as ColorResolvable
            const embed = new MessageEmbed()
                .setColor(colorTest);
            return interaction.reply({embeds: [embed]})

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