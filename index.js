//Initializes the discord client and requires the discord package.
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const Enmap = require('enmap');
const { permissionCheck, permissionsCheck } = require('./resources/permissionChecks');
const { msgPermsCheck, msgPermCheck } = require('./resources/msgPermCheck');
const mkdirp = require('mkdirp');


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
client.once('ready', async () => {
    client.logger.info(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(" lofi | /help", {
        type: "LISTENING"
      });
    await registerSlashCommands();
    client.logger.info(`${client.user.tag} finished setup`);
});

let importEvents = () => {
    fs.readdir("./events/", (err, files) => {
        if (err) return client.logger.error(err);
        files.forEach(file => {
          const event = require(`./events/${file}`);
          let eventName = file.split(".")[0];
          client.on(eventName, event.bind(null, client));
        });
    });
}


let importCommands = () => {
    client.commands = new Enmap();

    fs.readdir("./commands/", (err, files) => {
        if (err) return client.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            let props = require(`./commands/${file}`);
            let commandName = props.commandName;
            client.logger.info(`Attempting to load command ${commandName}`);
            client.commands.set(commandName, props);
        });
    });
}

let importKeywords = () => {
    client.keywords = new Enmap();

    fs.readdir("./keywords/", (err, files) => {
        if (err) return client.logger.error(err);
        files.forEach(file => {
            if (!file.endsWith(".js")) return;
            let props = require(`./keywords/${file}`);
            let keywordName = props.keywordName;
            client.logger.info(`Attempting to load keyword ${keywordName}`);
            client.keywords.set(keywordName, props);
        });
    });
}


//add new Enmap to store song recommendations
client.songRecs = new Enmap({name:'songs'});//create new enmap for song recommendations
client.songRecs.fetchEverything();

const registerSlashCommands = async () => {
    if (!client.application?.owner) await client.application?.fetch(); // make sure the bot is fully fetched

    if (client.config.mode == 'debug') {
        let guildCommands = await client.guilds.cache.get(client.config.test_server)?.commands.cache;
        for (let command of guildCommands) {
            await command.delete();
            client.logger.info(`Deleted ${command.name} from the guild command cache`)
        }
    } else {
        for (let command of client.application?.commands.cache) {
            await command.delete();
            client.logger.info(`Deleted ${command.name} from the application command cache`);
        }
    }
    
    client.commands.forEach(async (props, commandName) => {
        if (props.registerData) { //check the command has slash command data
            let registerData = props.registerData(client);
            client.logger.info(`Registering slash command ${commandName}`);
            //guild scope commands update instantly -- globally set ones are cached for an hour. If we are debugging, use guild scope
            if (client.config.mode == 'debug') {
                const command = await client.guilds.cache.get(client.config.test_server)?.commands.create(registerData);
            } else {
                const command = await client.application?.commands.create(registerData); //create it globally if we aren't debugging
            }           
        }
    });
    return true;
}

let checkConfig = () => {
    //checks the config file to see if all the listed keys are provided.
    const configArray = ['token','prefix','weather_token','stock_token','news_token','owner','nasa_token','crypto_token', 'test_server'];
    configArray.forEach((token) => {
        if(config.hasOwnProperty(token)==false){
            process.exitCode = 1;
            client.logger.error(`Missing config tokens, ending launch. Missing key: ${token}`);
            throw `Missing config tokens, ending launch. Missing key: ${token}`;
        }
    });
    if (config.mode != 'debug' && config.mode != 'production') {
        client.logger.error('Invalid config.mode: set to \'debug\' or \'production\'');
        throw 'Invalid config.mode: set to \'debug\' or \'production\'';
    }
}


//perform any necessary actions before logging into discord api
let startup = async () => {
    //create log directory
    await mkdirp('./logs');
    let now = new Date();
    let logfileName = `${now.getMonth()+1}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
    const logger = require('simple-node-logger').createSimpleLogger(`./logs/${logfileName}`);
    client.logger = logger;

    //perform config checks
    checkConfig();

    //import relevant files
    importEvents();
    importCommands();
    importKeywords();

    //Uses Token to login to the client
    client.login(config.token);
}

startup();