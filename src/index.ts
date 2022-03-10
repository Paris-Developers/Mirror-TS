import { Client, Intents } from 'discord.js';
import { Bot } from './Bot';
//@ts-ignore:next-line
import config from '../config.json';
import { PlayerOptions, Player, PlayerInitOptions } from 'discord-player';

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

export const playOptions: PlayerOptions = {
	leaveOnEnd: false,
	leaveOnEmpty: false,
	leaveOnStop: false,
};

export const player = new Player(bot.client, playOptions);

player.on('error', (queue, error) => {
	bot.logger.info(
		`[${queue.guild.name}] Error emitted from the queue: ${error.message}`
	);
});

bot.start();
