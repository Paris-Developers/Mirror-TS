//Mirror tells Discord which commands it has whenever it starts. Discord keeps that list until it
//is told otherwise, so the whole list is sent in one go, and only when something has changed.
//Sending it command by command meant dozens of requests on every restart
import {
	ApplicationCommand,
	ApplicationCommandData,
	ApplicationCommandManager,
	ApplicationCommandType,
	Collection,
	GuildApplicationCommandManager,
} from 'discord.js';
import { Bot } from '../Bot';

//either the list everyone sees or the list inside one server
type Commands = ApplicationCommandManager | GuildApplicationCommandManager;

//everything Mirror wants Discord to know about: the slash commands, then the right-click entries
function wantedCommands(bot: Bot): ApplicationCommandData[] {
	const slashCommands = bot.slashCommands.map((command) => ({
		name: command.name,
		description: command.description,
		options: command.options.map((option) => option.toJson()),
		type: ApplicationCommandType.ChatInput,
	}));
	const rightClickCommands = bot.userCommands.map((command) => ({
		name: command.name,
		type: ApplicationCommandType.User,
	}));
	return [...slashCommands, ...rightClickCommands] as ApplicationCommandData[];
}

//whether Discord already has exactly this list, down to each command's description and options
function alreadyRegistered(
	existing: Collection<string, ApplicationCommand>,
	wanted: ApplicationCommandData[]
): boolean {
	if (existing.size !== wanted.length) return false;
	return wanted.every((command) =>
		existing.some(
			(registered) =>
				registered.name === command.name && registered.equals(command, true)
		)
	);
}

//sends the list, unless Discord already has it
async function send(
	bot: Bot,
	commands: Commands,
	wanted: ApplicationCommandData[],
	where: string
): Promise<void> {
	const existing = await commands.fetch({});
	if (alreadyRegistered(existing, wanted)) {
		bot.logger.info(
			`The ${existing.size} commands Discord has ${where} are already up to date`
		);
		return;
	}
	const updated = await commands.set(wanted);
	bot.logger.info(
		`Registered ${updated.size} commands ${where}, replacing the ${existing.size} Discord had`
	);
}

//commands left behind somewhere they shouldn't be would be listed twice in Discord's menus
async function removeLeftovers(
	bot: Bot,
	commands: Commands,
	where: string
): Promise<void> {
	const existing = await commands.fetch({});
	if (!existing.size) return;
	await commands.set([]);
	bot.logger.info(`Removed ${existing.size} leftover commands ${where}`);
}

export async function registerSlashCommands(bot: Bot): Promise<boolean> {
	if (!bot.client.application?.owner) await bot.client.application?.fetch(); // make sure the bot is fully fetched
	await bot.client.guilds.fetch(); // make sure the guilds are fully fetched

	const application = bot.client.application;
	if (!application) {
		bot.logger.error('Cannot register commands: Discord has not sent the application yet');
		return false;
	}
	const wanted = wantedCommands(bot);
	//sending an empty list would take every command away from every server, so if the commands
	//somehow failed to load, leave what Discord already has alone
	if (!wanted.length) {
		bot.logger.error('Not registering commands: Mirror loaded none to register');
		return false;
	}
	const testServer = bot.test_server
		? bot.client.guilds.cache.get(bot.test_server)
		: undefined;

	if (bot.mode == 'debug') {
		if (!testServer) {
			bot.logger.error(
				`Cannot register commands: test_server ${bot.test_server} is not a server Mirror is in`
			);
			return false;
		}
		//commands set inside one server appear there straight away, which is what debugging wants
		await send(bot, testServer.commands, wanted, `in ${testServer.name}`);
		//the commands every server sees are left alone, even though the test server then lists each
		//one twice. if this token is also the live bot's, removing them would take /play and the rest
		//away from every server until the live bot restarts
		const everywhere = await application.commands.fetch({});
		if (everywhere.size) {
			bot.logger.info(
				`Left the ${everywhere.size} commands every server sees alone, so ${testServer.name} may list commands twice. If this is the live bot's token, give test copies their own bot application instead`
			);
		}
		return true;
	}

	await send(bot, application.commands, wanted, 'in every server');
	//debug runs leave their own copies behind in the test server
	if (testServer) {
		await removeLeftovers(bot, testServer.commands, `in ${testServer.name}`);
	}
	//older versions registered commands inside every server. Nothing does that any more, so the
	//sweep for them is a one-off: start the bot once with CLEAN_GUILD_COMMANDS=1 set
	if (process.env.CLEAN_GUILD_COMMANDS) {
		for (const guild of bot.client.guilds.cache.values()) {
			await removeLeftovers(bot, guild.commands, `in ${guild.name}`);
		}
	}
	return true;
}
