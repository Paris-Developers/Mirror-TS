import { Bot } from '../Bot';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

let promisedReaddir = promisify(fs.readdir);

export async function registerEvents(bot: Bot) {
	let files = await promisedReaddir(`${__dirname}/../events/`);
	for (let file of files) {
		if (!file.endsWith('.js')) continue;
		// if it's the base class or the old class holder file, ignore it
		if (file == 'EventHandler.js' || file == 'Events.js') continue;
		// get all the exports from the file
		let module = await import(`${__dirname}/../events/${file}`);
		// make a new object using the exported class
		let eventHandler = new module[path.parse(file).name]();
		let eventName = eventHandler.eventName;
		bot.logger.info(`Loaded EventHandler ${eventName}`);
		// push the new object to our array
		bot.client.on(eventHandler.eventName, eventHandler.process.bind(null, bot));
	}
}
