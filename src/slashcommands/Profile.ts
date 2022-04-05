import { CommandInteraction, CacheType, MessageEmbed } from "discord.js";
import { Bot } from "../Bot";
import { colorCheck } from "../resources/embedColorCheck";
import { Option, Subcommand } from "./Option";
import { SlashCommand } from "./SlashCommand";

export class Profile implements SlashCommand {
    name: string = 'profile';
    description: string = 'View your Mirror profile';
    options: (Option | Subcommand)[] = [];
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            let user = interaction.user;
            const embed = new MessageEmbed()
                .setTitle(`Mirror profile for ${user.username}`)
                .setColor(colorCheck(interaction.guild!.id))
                .setImage(user.avatar ? user.avatar : user.defaultAvatarURL);
            return interaction.reply({embeds: [embed]});
        } catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				ephemeral: true,
			});
		}
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined;
    blockSilenced?: boolean | undefined;
    musicCommand?: boolean | undefined;

} 