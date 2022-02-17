import { CommandInteraction } from "discord.js";
import { Bot } from "../bot";

module.exports = async (bot: Bot) => {

    bot.logger.info("Registering slash commands");
    bot.registerSlashCommands();

}