import { Client, Intents } from 'discord.js';
import { Bot } from './Bot';
//@ts-ignore:next-line
import config from '../config.json';
const { Player } = require('discord-player');

let options = {
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
};
let bot = new Bot(
	config.token,
	new Client(options),
	'$',
	config.mode,
	config.test_server
);
const player = new Player(bot.client);

bot.start();
