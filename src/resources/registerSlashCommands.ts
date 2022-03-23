import { Bot } from '../Bot';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

async function deleteCommandsFromGuild(
	bot: Bot,
	guildId: string,
	hardDelete?: boolean
) {
	if (typeof hardDelete == undefined) hardDelete = false;
	let guild = await bot.client.guilds.fetch(guildId);
	let guildCommands = await guild.commands.fetch();
	for (let [commandKey, registeredCommand] of guildCommands!) {
		let command = bot.slashCommands.find(
			(command) => command.name === registeredCommand.name
		);
		if (!hardDelete && command) continue;
		await registeredCommand.delete();
		bot.logger.info(
			`Deleted ${registeredCommand.name} from the guild ${guildId} command cache`
		);
	}
}

async function deleteCommandsFromApplication(bot: Bot, hardDelete?: boolean) {
	if (typeof hardDelete == undefined) hardDelete = false;
	let commands = await bot.client.application?.commands.fetch();
	for (let [commandKey, registeredCommand] of commands!) {
		let command = bot.slashCommands.find(
			(command) => command.name === registeredCommand.name
		);
		if (!hardDelete && command) continue;
		await registeredCommand.delete();
		bot.logger.info(
			`Deleted ${registeredCommand.name} from the application command cache`
		);
	}
}

export async function registerSlashCommands(bot: Bot): Promise<boolean> {
	bot.logger.info('Registering slash commands');
	if (!bot.client.application?.owner) await bot.client.application?.fetch(); // make sure the bot is fully fetched
	await bot.client.guilds.fetch(); // make sure the guilds are fully fetched

	if (bot.mode == 'debug') {
		await deleteCommandsFromGuild(bot, bot.test_server);
		// we don't want to double up our command entries, so remove them from the global cache
		await deleteCommandsFromApplication(bot, true);
	} else {
		// we want to remove our local guild commands from all servers, so we don't duplicate command entries
		// this may take a long, long while depending on how many servers the bot was run in debug mode
		let guildIds = bot.client.guilds.cache.map((guild) => guild.id);
		for (let guild of guildIds) {
			await deleteCommandsFromGuild(bot, guild, true);
		}
		deleteCommandsFromApplication(bot);
	}

	bot.slashCommands.forEach(async (command) => {
		let JsonOptionData = [];
		for (let option of command.options) {
			JsonOptionData.push(option.toJson());
		}

		let registerData = {
			name: command.name,
			description: command.description,
			options: JsonOptionData,
		};
		bot.logger.info(`Registering slash command ${command.name}`);
		//guild scope commands update instantly -- globally set ones are cached for an hour. If we are debugging, use guild scope
		if (bot.mode == 'debug') {
			const registeredCommand = await bot.client.guilds.cache
				.get(bot.test_server)
				?.commands.create(registerData);
		} else {
			const registeredCommand = await bot.client.application?.commands.create(
				registerData
			); //create it globally if we aren't debugging
		}
	});
	return true;
}
