
import {
    ChatInputCommandInteraction,
    CacheType,
    EmbedBuilder,
    PermissionFlagsBits,
    ApplicationCommandOptionType
} from 'discord.js';
import { Bot } from "../Bot";
import { SlashCommand } from "./SlashCommand";
import { Subcommand, Option } from "./Option";
import { colorCheck } from "../resources/embedColorCheck";

export class Tickle implements SlashCommand {
    name: string = 'tickle';
    description = 'Get tickled';
    options: (Option | Subcommand)[] = [
        new Option(
            'user',
            'The user to tickle',
            ApplicationCommandOptionType.User,
            false
        ),
    ];
    requiredPermissions: bigint[] = [
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
    ];
    async run(
        bot: Bot,
        interaction: ChatInputCommandInteraction<CacheType>
    ): Promise<any> {
        try {
            let res = await fetch(`https://nekos.best/api/v2/tickle`);
            let jsonData = await res.json();
            let tickleEmbed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id)).setImage(jsonData.results[0].url).setTitle(jsonData.results[0].anime_name);
            if (interaction.options.getUser('user')) {
                tickleEmbed.setDescription(`${interaction.user} tickled ${interaction.options.getUser('user')}`);
            }
            interaction.reply({ embeds: [tickleEmbed] });
        } catch (err) {
            bot.logger.commandError(interaction.channel!.id, this.name, err);
            return interaction.reply({
                content: 'Error: contact a developer to investigate',
                ephemeral: true,
            });
        }
    }
}