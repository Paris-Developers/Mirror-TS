import { CommandInteraction } from "discord.js";
import { Bot } from "../bot";

module.exports = async (bot: Bot, interaction: CommandInteraction) => {
    if (!interaction.isCommand()) return;

    if (!bot.commands.has(interaction.commandName)) return;

    bot.commands.get(interaction.commandName).run(bot, interaction);

}