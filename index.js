//Initializes the discord client and requires the discord package.
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const { permissionCheck, permissionsCheck } = require('./resources/permissionChecks');
const { msgPermsCheck, msgPermCheck } = require('./resources/msgPermCheck');


//Requires the config.json file, creates token as a constant
const config = require('./config.json');

//Creates instance of client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES]});

client.config = config; // we want config to be accessible anywhere client is

client.permissionCheck = permissionCheck; //we want permissionCheck to be accessible wherever client is present.
client.permissionsCheck = permissionsCheck;
client.msgPermCheck = msgPermCheck;
client.msgPermsCheck = msgPermsCheck;

//This line runs once the discord client is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(" lofi | /help", {
        type: "LISTENING"
      });
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

    if (client.config.mode == 'debug') {
        let guildCommands = await client.guilds.cache.get(client.config.test_server)?.commands.cache;
        for (let command of guildCommands) {
            await command.delete();
            console.log(`Deleted ${command.name} from the guild command cache`)
        }
    } else {
        for (let command of client.application?.commands.cache) {
            await command.delete();
            console.log(`Deleted ${command.name} from the application command cache`);
        }
    }
    
    client.commands.forEach(async (props, commandName) => {
        if (props.registerData) { //check the command has slash command data
            let registerData = props.registerData(client);
            console.log(`Registering slash command ${commandName}`);
            //guild scope commands update instantly -- globally set ones are cached for an hour. If we are debugging, use guild scope
            if (client.config.mode == 'debug') {
                const command = await client.guilds.cache.get(client.config.test_server)?.commands.create(registerData);
            } else {
                const command = await client.application?.commands.create(registerData); //create it globally if we aren't debugging
            }           
        }
    })
}

//checks the config file to see if all the listed keys are provided.
const configArray = ['token','prefix','weather_token','stock_token','news_token','owner','nasa_token','crypto_token', 'test_server'];
configArray.forEach((token) => {
    if(config.hasOwnProperty(token)==false){
        process.exitCode = 1;
        throw `Missing config tokens, ending launch. Missing key: ${token}`;
    }
});
if (config.mode != 'debug' && config.mode != 'production') {
    console.log('Invalid config.mode: set to \'debug\' or \'production\'')
}

//Uses Token to login to the client
client.login(config.token);
