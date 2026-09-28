import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Bot } from './Bot';
import { unhandledRejections } from './resources/metrics';
import { answeredElsewhere } from './resources/instanceGuard';
import config, { configText } from './resources/config';

// each of the bot's 13 enmaps adds its own process 'exit' listener to close the database
process.setMaxListeners(25);

let options = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		// privileged: needed for $ commands and keywords; enable it in the Discord developer portal
		GatewayIntentBits.MessageContent,
	],
	// DM channels aren't cached, so v14 needs this partial to receive DMs
	partials: [Partials.Channel],
};
let bot = new Bot(
	config.token,
	new Client(options),
	'$',
	config.mode,
	config.test_server,
	configText('production_host')
);

// a failed request to Discord, like replying to a command that already timed out, is logged instead of stopping the bot
process.on('unhandledRejection', (error) => {
	unhandledRejections.inc();
	//a command another copy of Mirror already answered gets its own, louder message
	if (answeredElsewhere(bot, error)) return;
	bot.logger.error('Unhandled promise rejection:', error);
});

// an error nothing caught, such as one thrown while a sound is being sent, can leave the bot stuck
// (the voice libraries stop sending sound to every server), so it is logged in the bot's own log
// and the bot exits for pm2 to restart it. the pause lets the log line reach the file first
process.on('uncaughtException', (error) => {
	bot.logger.fatal('Uncaught exception, exiting:', error);
	process.exitCode = 1;
	setTimeout(() => process.exit(1), 1000);
});

bot.start();
