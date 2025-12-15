import { Client, GatewayIntentBits } from 'discord.js';
import { Bot } from './Bot';
//@ts-ignore:next-line
import config from '../config.json';

let options = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers
	],
};
let bot = new Bot(
	config.token,
	new Client(options),
	'$',
	config.mode,
	config.test_server
);

bot.start();
