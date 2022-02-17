//Call: Slash command test
//Returns a greeting reply to the user
import { Bot } from "../bot";
import { Permissions, CommandInteraction } from 'discord.js';

exports.commandName = 'test';

exports.registerData = (bot: Bot) => {
    return {
        name: exports.commandName,
        description: 'Replies with your name!',
    }
};

exports.run = async (bot: Bot, interaction: CommandInteraction) => {
    interaction.reply(`Hello ${interaction.user.username}`);
}

