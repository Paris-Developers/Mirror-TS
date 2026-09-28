import { DiscordAPIError, RESTJSONErrorCodes } from 'discord.js';
import { existsSync, readFileSync, statSync } from 'fs';
import { hostname } from 'os';
import path from 'path';
import { Bot } from '../Bot';

//whether this copy of Mirror should act on an event from the given server.
//Discord delivers every event to every copy of the bot logged in with the same token, so a test
//copy that answered everything would fight the live bot for commands and voice.
//a copy in debug mode only acts in its test server. direct messages have no server and are left to
//the live bot as well: a debug copy sharing its token would race it for every one, and anything a
//direct message can do can be tried in the test server instead. production acts everywhere.
//called at the top of InteractionCreate, MessageCreate and VoiceStateUpdate
export function handledHere(bot: Bot, guildId: string | null | undefined): boolean {
	if (bot.mode != 'debug') return true;
	return !!guildId && guildId === bot.test_server;
}

//Discord refuses a second answer to the same command with error 40060. Mirror answers each command
//once, so seeing it almost always means another copy of Mirror is logged in with the same token and
//got there first (a request retried after a timeout can also cause it, but rarely).
//logs it loudly and returns true, so a catch block can tell it apart from a real failure
export function answeredElsewhere(bot: Bot, error: unknown): boolean {
	if (!(error instanceof DiscordAPIError)) return false;
	if (error.code !== RESTJSONErrorCodes.InteractionHasAlreadyBeenAcknowledged) return false;
	bot.logger.error(
		`Discord says this command was already answered (error 40060). Another copy of Mirror is probably logged in with the same token and answered it first. This copy is on ${hostname()} in ${bot.mode} mode. Stop the other copy, and give test copies their own bot application's token`,
		error
	);
	return true;
}

//which commit the project folder is on, read straight from .git so it works where git isn't installed
function checkedOutCommit(root: string): string {
	try {
		const git = path.join(root, '.git');
		let head = readFileSync(path.join(git, 'HEAD'), 'utf8').trim();
		if (head.startsWith('ref: ')) {
			const ref = head.slice(5);
			//a branch is kept in its own file, or in packed-refs once git has tidied up
			head = existsSync(path.join(git, ref))
				? readFileSync(path.join(git, ref), 'utf8').trim()
				: (readFileSync(path.join(git, 'packed-refs'), 'utf8')
						.split(/\r?\n/)
						.find((line) => line.endsWith(` ${ref}`))
						?.split(' ')[0] ?? '');
		}
		return head.slice(0, 7) || 'unknown';
	} catch {
		return 'unknown';
	}
}

//when the running code was compiled. build.bat deletes built/ and compiles it fresh, so an old date
//here means the latest pull was never built
function buildTime(): string {
	try {
		return statSync(__filename).mtime.toLocaleString();
	} catch {
		return 'unknown';
	}
}

//the exit code of a copy that refused to log in. ecosystem.config.js tells pm2 not to restart on it,
//since restarting would only refuse again, forever, with a new log file each time
export const refusedExitCode = 78;

//runs before Mirror logs in. it says which machine, mode and code this copy is, so a second copy
//logged in with the same token stands out in the logs, and it refuses to log a production copy in
//anywhere but the machine named by the optional production_host in config.json.
//returns false when this copy must not log in
export function startupCheck(bot: Bot): boolean {
	const host = hostname();
	//built/src/resources is three folders down from the project folder
	const root = path.resolve(__dirname, '../../..');
	bot.logger.info(
		`Mirror is starting on ${host} in ${bot.mode} mode (commit ${checkedOutCommit(root)}, built ${buildTime()}, Node ${process.version})`
	);

	if (bot.mode == 'debug') {
		if (!bot.test_server) {
			bot.logger.warn(
				'Debug mode only acts in test_server, and config.json does not set one, so this copy will ignore every server'
			);
		} else {
			bot.logger.info(
				`Debug mode: only acting in the test server ${bot.test_server}, and leaving the commands every server sees alone`
			);
		}
		return true;
	}

	if (bot.mode != 'production') {
		bot.logger.warn(`mode "${bot.mode}" in config.json is neither debug nor production, so this copy runs as production`);
	}
	if (!bot.production_host) {
		//only a warning, so a live bot whose config.json predates this setting keeps starting as before
		bot.logger.warn(
			`production_host is not set in config.json. Set it to the name of the machine the live bot runs on (this machine is ${host}), so a copy of this config started anywhere else refuses to log in instead of fighting the live bot`
		);
		return true;
	}
	//Windows shows a machine's name in a few forms (the host name, the shorter COMPUTERNAME, and a
	//full name ending in the network's domain), and any of them counts
	const wanted = bot.production_host.trim().toLowerCase().split('.')[0];
	const names = [host, process.env.COMPUTERNAME ?? ''].map((name) => name.toLowerCase().split('.')[0]);
	if (names.includes(wanted)) return true;
	bot.logger.fatal(
		`Not logging in: config.json says the live bot runs on ${bot.production_host.trim()}, but this machine is ${host}. A second copy logged in with the same token fights the live bot for every command and voice channel. To test here, use a separate bot application's token with "mode": "debug"`
	);
	return false;
}
