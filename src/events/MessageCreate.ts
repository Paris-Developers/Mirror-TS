import { Message, TextChannel } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from '../keywords/Keyword';
import { MessageCommand } from '../messagecommands/MessageCommand';
import { messageXP } from '../slashcommands/Profile';
import { EventHandler } from './EventHandler';

export class MessageCreate implements EventHandler {
	eventName = 'messageCreate';
	async process(bot: Bot, message: Message): Promise<void> {
		//ignore all bots
		if (message.author.bot) return;

		messageXP(message.author.id, message.guild ? message.guild.id : undefined);

		var prefix = bot.prefix;

		//check for prefix to determine if command or not
		let isCommand: boolean = message.content.indexOf(prefix) == 0;

		//parse out arguments and get the base command name
		let args: Array<string> = message.content.trim().split(/ +/g);

		//ternary operator -> checks to see if expression before ? is true, if true, use expression left of colon, if false, use expression right of colon
		const commandName = isCommand
			? args[0].slice(prefix.length).toLowerCase()
			: args[0].toLowerCase(); //if it's a command we need to slice out the prefix
		args.shift(); //remove the first argument because we won't need to pass the command/keyword name to the triggered function
		const command: undefined | Keyword | MessageCommand = isCommand
			? bot.messageCommands.find((command) => command.name === commandName)
			: bot.keywords.find((keyword) => keyword.name === commandName); //if it's a command, get it from command enmap, otherwise check keyword enmap

		//if the command/keyword doesn't exist, just exit
		if (!command) return;

		if (command.requiredPermissions) {
			if (
				!(await bot.msgPermsCheck(bot, message, command.requiredPermissions))
			) {
				// We don't have all the permissions we need. Log and return.
				if (!(message.channel instanceof TextChannel)) {
					bot.logger.error(
						undefined,
						undefined,
						`Somehow permissionsCheck returned false in a non-textchannel. Offending command: ${command.name}`
					);
				} else {
					bot.logger.warn(
						`Missing permissions to use ${command.name} in channel: ${
							message.channel!.name
						}, in ${message.guild!.name}`
					);
				}
				return;
			}
		}

		//run command/keyword
		command.run(bot, message, args);
	}
}
