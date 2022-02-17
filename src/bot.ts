import {Client} from 'discord.js';
import { CustomLogger } from './CustomLogger';
import { TLogLevelName } from 'tslog';
import { permissionsCheck } from './resources/permissionsCheck';
import { readdir } from 'fs';
import Enmap from 'enmap';

export class Bot {

    public logger: CustomLogger;

    //helper functions
    public permissionsCheck = permissionsCheck;

    //data stores
    public commands: Enmap = new Enmap();

    constructor(
        private token: string,
        public client: Client,
        private mode: string,
        private test_server: string
    ){
        //initialize logger
        let now = new Date();
        let logfileName = `./logs/${now.getMonth()+1}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
        let logLevel: TLogLevelName = this.mode == 'debug' ? "debug" : "info";
        this.logger = new CustomLogger(logfileName, logLevel);
    }

    public async start(): Promise<void> {

        await this.logger.initialize();
        this.logger.debug("Logging initialized");

        await this.importEvents();
        await this.importCommands();
       
        this.client.login(this.token);

    }

    async importCommands() {    
        readdir("./commands/", (err, files) => {
            if (err) return this.logger.error(err.message);
            files.forEach(file => {
                if (!file.endsWith(".js")) return;
                let props = require(`./commands/${file}`);
                let commandName = props.commandName;
                this.logger.info(`Attempting to load command ${commandName}`);
                this.commands.set(commandName, props);
            });
        });
    }

    async importEvents() {
        readdir("./events/", (err, files) => {
            if (err) return this.logger.error(err.message);
            files.forEach(file => {
                if (!file.endsWith(".js")) return;
                const event = require(`./events/${file}`);
                let eventName = file.split(".")[0];
                this.client.on(eventName, event.bind(null, this));
            });
        });
    }
    
    public async registerSlashCommands() {
        if (!this.client.application?.owner) await this.client.application?.fetch(); // make sure the bot is fully fetched
    
        if (this.mode == 'debug') {
            let guildCommands = await this.client.guilds.cache.get(this.test_server)?.commands.cache;
            for (let [commandKey, command] of guildCommands!) {
                await command.delete();
                this.logger.info(`Deleted ${command.name} from the guild command cache`)
            }
        } else {
            for (let [commandKey, command] of this.client.application?.commands.cache!) {
                await command.delete();
                this.logger.info(`Deleted ${command.name} from the application command cache`);
            }
        }
        
        this.commands.forEach(async (props, commandName) => {
            if (props.registerData) { //check the command has slash command data
                let registerData = props.registerData(this);
                this.logger.info(`Registering slash command ${commandName}`);
                //guild scope commands update instantly -- globally set ones are cached for an hour. If we are debugging, use guild scope
                if (this.mode == 'debug') {
                    const command = await this.client.guilds.cache.get(this.test_server)?.commands.create(registerData);
                } else {
                    const command = await this.client.application?.commands.create(registerData); //create it globally if we aren't debugging
                }           
            }
        });
        return true;
    }

}