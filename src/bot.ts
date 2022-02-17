import { Client } from 'discord.js';
import { CustomLogger } from './CustomLogger';
import { TLogLevelName } from 'tslog';
import { permissionsCheck } from './resources/permissionsCheck';
import { readdir } from 'fs';
import { Commands } from './commands/Commands';
import { Events } from './events/Events';
import Enmap from 'enmap';

export class Bot {
	public logger: CustomLogger;

	//helper functions
	public permissionsCheck = permissionsCheck;

	//data stores
	public commands: Enmap = Commands;

	constructor(
		private token: string,
		public client: Client,
		private mode: string,
		private test_server: string
	) {
		//initialize logger
		let now = new Date();
		let logfileName = `${__dirname}/../logs/${
			now.getMonth() + 1
		}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
		let logLevel: TLogLevelName = this.mode == 'debug' ? 'debug' : 'info';
		this.logger = new CustomLogger(logfileName, logLevel);
	}

	public async start(): Promise<void> {
		await this.logger.initialize();
		this.logger.debug('Logging initialized');

		this.registerEvents();

		this.client.login(this.token);
	}

	registerEvents() {
		for (let event of Events) {
			this.client.on(event.eventName, event.process.bind(null, this));
		}
	}

	public async registerSlashCommands() {
		this.logger.info('Registering slash commands');
		if (!this.client.application?.owner)
			await this.client.application?.fetch(); // make sure the bot is fully fetched

		if (this.mode == 'debug') {
			let guildCommands = await this.client.guilds.cache.get(
				this.test_server
			)?.commands.cache;
			for (let [commandKey, command] of guildCommands!) {
				await command.delete();
				this.logger.info(
					`Deleted ${command.name} from the guild command cache`
				);
			}
		} else {
			for (let [commandKey, command] of this.client.application?.commands
				.cache!) {
				await command.delete();
				this.logger.info(
					`Deleted ${command.name} from the application command cache`
				);
			}
		}

		this.commands.forEach(async (command, commandName) => {
			if (command.registerData) {
				//check the command has slash command data
				let registerData = command.registerData;
				this.logger.info(`Registering slash command ${commandName}`);
				//guild scope commands update instantly -- globally set ones are cached for an hour. If we are debugging, use guild scope
				if (this.mode == 'debug') {
					const registeredCommand = await this.client.guilds.cache
						.get(this.test_server)
						?.commands.create(registerData);
				} else {
					const registeredCommand =
						await this.client.application?.commands.create(
							registerData
						); //create it globally if we aren't debugging
				}
			}
		});
		return true;
	}
}
