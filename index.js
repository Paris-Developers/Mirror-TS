//Initializes the discord client and requires the discord package.
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');


//Requires the config.json file, creates token as a constant
const config = require('./config.json');

//Creates instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]});

client.config = config; // we want config to be accessible anywhere client is

//This line runs once the discord client is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    registerSlashCommands();
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
        let commandName = props.commandName;
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
    });
});

client.keywords = new Enmap();

fs.readdir("./keywords/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        if (!file.endsWith(".js")) return;
        let props = require(`./keywords/${file}`);
        let keywordName = props.keywordName;
        console.log(`Attempting to load keyword ${keywordName}`);
        client.keywords.set(keywordName, props);
    });
});

//add new Enmap to store song recommendations
client.songRecs = new Enmap({name:'songs'});//create new enmap for song recommendations
client.songRecs.fetchEverything();

const registerSlashCommands = async () => {
    if (!client.application?.owner) await client.application?.fetch(); // make sure the bot is fully fetched

    //todo -- delete all commands from the cache before re-registering them

    client.commands.forEach(async (props, commandName) => {
        if (props.registerData) { //check the command has slash command data
            console.log(`Registering slash command ${commandName}`);
            //guild scope commands update instantly -- globally set ones are cached for an hour. If we are debugging, use guild scope
            if (client.config.mode == "debug") {
                const command = await client.guilds.cache.get(client.config.test_server)?.commands.create(props.registerData);
            } else {
                const command = await client.application?.commands.create(props.registerData); //create it globally if we aren't debugging
            }
        }
    })
}

//checks the config file to see if all the listed keys are provided.
const configArray = ["token","prefix","weather_token","stock_token","news_token","owner","nasa_token","crypto_token"];
configArray.forEach((token) => {
    if(config.hasOwnProperty(token)==false){
        process.exitCode = 1;
        throw `Missing config tokens, ending launch. Missing key: ${token}`;
    }
});

//Uses Token to login to the client
client.login(config.token);
