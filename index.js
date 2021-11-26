//Initializes the discord client and requires the discord package.
const { Client, Intents } = require('discord.js');

//Requires the config.json file, creates token as a constant
const config = require('./config.json');

//Creates instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS]});

client.config = config; // we want config to be accessible anywhere client is

//This line runs once the discord client is ready
client.once('ready', () => {
    console.log('Ready!');
});

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      const event = require(`./events/${file}`);
      let eventName = file.split(".")[0];
      client.on(eventName, event.bind(null, client));
    });
});
  
client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});


//Uses Token to login to the client
client.login(config.token);