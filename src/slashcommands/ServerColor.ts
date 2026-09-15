import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ColorResolvable,
	MessageFlags,
	ApplicationCommandOptionType,
} from "discord.js";
import { normalizeColor } from "../resources/embedColorCheck";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";

export const serverColors = new Enmap({ name: 'serverColors' });

export class ServerColor implements SlashCommand {
    name: string = 'servercolor';
    description: string = '[MANAGER] Set the color to be used in Mirror message embeds';
    options: (Option | Subcommand)[] = [
        new Option(
            'color',
            'The color you want to set',
            ApplicationCommandOptionType.String,
            true,
        )
    ]
    requiredPermissions: bigint[] = [];
    async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        try{
            let color = normalizeColor(interaction.options.getString('color')!.toUpperCase());
            try{
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription('This is your new server color!');
                serverColors.set(interaction.guild!.id, color);
                return void interaction.reply({embeds: [embed]});
            } catch (err){
                return void interaction.reply({content: 'Invalid color, please try again with format: \'#ABC123\' or Blue or Random'});
            }
        } catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return void interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
			
		}
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined = true;
    blockSilenced?: boolean | undefined;
    musicCommand?: boolean | undefined;
    
}