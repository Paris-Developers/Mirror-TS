import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Bot } from './Bot';
//@ts-ignore:next-line
import config from '../config.json';

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
	config.test_server
);

// a failed request to Discord, like replying to a command that already timed out, is logged instead of stopping the bot
process.on('unhandledRejection', (error) => bot.logger.error('Unhandled promise rejection:', error));

bot.start();
