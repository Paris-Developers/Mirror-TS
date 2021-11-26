//Initializes the discord client and requires the discord package.
const { Client, Intents } = require('discord.js');

//Requires the config.json file, creates token as a constant
const { token } = require('./config.json');

//Creates instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS]});

//This line runs once the discord client is ready
client.once('ready', () => {
    console.log('Ready!');
});

//Uses Token to login to the client
client.login(token);