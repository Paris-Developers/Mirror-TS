import { Message } from 'discord.js';
import { Bot } from '../Bot';
import { Keyword } from '../keywords/Keyword';
import { MessageCommand } from '../messagecommands/MessageCommand';
import { EventHandler } from './EventHandler';
import { handledHere } from '../resources/instanceGuard';

export class MessageCreate implements EventHandler {
	eventName = 'messageCreate';
	async process(bot: Bot, message: Message): Promise<void> {
		//ignore all bots
		if (message.author.bot) return;
		if (!handledHere(bot, message.guildId)) return;
		//$ commands and keywords are for servers. A direct message used to crash the permission check,
		//which looks the bot up in the server, so none of them ever ran there anyway
		if (!message.inGuild()) return;

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

		if (!(await bot.msgPermsCheck(bot, message, command.requiredPermissions))) {
			// We don't have all the permissions we need. Log and return.
			bot.logger.warn(
				`Missing permissions to use ${command.name} in channel: ${message.channel.name}, in ${message.guild.name}`
			);
			return;
		}

		//run command/keyword. They catch their own errors, so this only logs one that gets past them,
		//under the command's name rather than as a bare unhandled rejection
		command
			.run(bot, message, args)
			.catch((error) => bot.logger.commandError(message.channelId, command.name, error));
	}
}
