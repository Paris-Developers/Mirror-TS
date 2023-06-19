import { Client, IntentsBitField } from 'discord.js';
import { Bot } from './Bot';
//@ts-ignore:next-line
import config from '../config.json';

let options = {
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.GuildVoiceStates,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.GuildMembers
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
