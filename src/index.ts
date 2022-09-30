import { Client, Intents } from 'discord.js';
import { Bot } from './Bot';
//@ts-ignore:next-line
import config from '../config.json';

let options = {
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.DIRECT_MESSAGES,
	],
};

let mirror = new Bot(
	config.mirror_token,
	new Client(options),
	'$',
	config.mode,
	config.test_server
);

let distortion = new Bot(
	config.distortion_token,
	new Client(options),
	'',
	config.mode,
	config.test_server
)

distortion.start(true);
mirror.start(false);
