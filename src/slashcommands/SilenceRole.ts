import { ApplicationCommandDataResolvable, CommandInteraction, CacheType } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import Enmap from "enmap";
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";

const silencedRole = new Enmap('SilencedRole');

export class SilenceRole implements SlashCommand {
    name: string = 'silencerole';
    registerData: ApplicationCommandDataResolvable = {
        name: this.name,
        description: '[MANAGER] Set a role from using Birthday, Intro, or Music commands.',
        options: [{
            name: 'role',
            description: 'The role to silence.',
            type: ApplicationCommandOptionTypes.ROLE,
            required: true,
        }]
    }
    requiredPermissions: bigint[] = [];
    run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
        try{
            
        } catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}

        throw new Error("Method not implemented.");
    }
    guildRequired?: boolean | undefined = true;
    managerRequired?: boolean | undefined = true;
    
}