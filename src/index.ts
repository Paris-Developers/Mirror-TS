import {Client, Intents} from 'discord.js';
import {Bot} from './bot';


let options = { intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES]};

let bot = new Bot("test", new Client(options), "debug");

async function start() {
    await bot.start();
    bot.logger.info("another test");
}

start();