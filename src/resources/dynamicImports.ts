import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { Bot } from '../Bot';

let promisedReaddir = promisify(fs.readdir);

export async function importSlashCommands(bot: Bot) {
	//get all filenames in slashcommand directory
	let files = await promisedReaddir(`${__dirname}/../slashcommands/`);
	for (let file of files) {
		// if it's not a javascript file, ignore it
		if (!file.endsWith('.js')) continue;
		// if it's the base classes, ignore it
		if (file == 'SlashCommand.js' || file == 'Option.js') continue;
		// get all the exports from the file
		let module = await import(`${__dirname}/../slashcommands/${file}`);
		// make a new object using the exported class
		let command = new module[path.parse(file).name]();
		let commandName = command.name;
		bot.logger.info(`Loaded slash command ${commandName}`);
		// push the new object to our array
		bot.slashCommands.push(command);
	}
}

export async function importMessageCommands(bot: Bot) {
	let files = await promisedReaddir(`${__dirname}/../messagecommands/`);
	for (let file of files) {
		if (!file.endsWith('.js')) continue;
		if (file == 'MessageCommand.js' || file == 'MessageCommands.js') continue;
		let module = await import(`${__dirname}/../messagecommands/${file}`);
		let command = new module[path.parse(file).name]();
		let commandName = command.name;
		bot.logger.info(`Loaded message command ${commandName}`);
		bot.messageCommands.push(command);
	}
}
export async function importKeywords(bot: Bot) {
	let files = await promisedReaddir(`${__dirname}/../keywords/`);
	for (let file of files) {
		if (!file.endsWith('.js')) continue;
		if (file == 'Keyword.js' || file == 'Keywords.js') continue;
		let module = await import(`${__dirname}/../keywords/${file}`);
		let keyword = new module[path.parse(file).name]();
		let keywordName = keyword.name;
		bot.logger.info(`Loaded keyword ${keywordName}`);
		bot.keywords.push(keyword);
	}
}
