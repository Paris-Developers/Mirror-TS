import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
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
		// get all the exports from the file (import() needs a file:// URL on Windows)
		let module = await import(pathToFileURL(path.join(__dirname, '..', 'slashcommands', file)).href);
		// make a new object using the exported class
		let command = new module[path.parse(file).name]();
		let commandName = command.name;
		bot.logger.info(`Loaded slash command ${commandName}`);
		// push the new object to our array
		bot.slashCommands.push(command);
	}
}

export async function importUserCommands(bot: Bot) {
	//commands on the right-click menu for a person, such as looking up a birthday
	let files = await promisedReaddir(`${__dirname}/../usercommands/`);
	for (let file of files) {
		if (!file.endsWith('.js')) continue;
		if (file == 'UserCommand.js') continue;
		let module = await import(pathToFileURL(path.join(__dirname, '..', 'usercommands', file)).href);
		let command = new module[path.parse(file).name]();
		let commandName = command.name;
		bot.logger.info(`Loaded right-click command ${commandName}`);
		bot.userCommands.push(command);
	}
}

export async function importMessageCommands(bot: Bot) {
	let files = await promisedReaddir(`${__dirname}/../messagecommands/`);
	for (let file of files) {
		if (!file.endsWith('.js')) continue;
		if (file == 'MessageCommand.js' || file == 'MessageCommands.js') continue;
		let module = await import(pathToFileURL(path.join(__dirname, '..', 'messagecommands', file)).href);
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
		let module = await import(pathToFileURL(path.join(__dirname, '..', 'keywords', file)).href);
		let keyword = new module[path.parse(file).name]();
		let keywordName = keyword.name;
		bot.logger.info(`Loaded keyword ${keywordName}`);
		bot.keywords.push(keyword);
	}
}
