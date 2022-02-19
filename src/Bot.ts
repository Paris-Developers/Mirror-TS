import { Client, TextChannel } from 'discord.js';
import { CustomLogger } from './CustomLogger';
import { TLogLevelName } from 'tslog';
import { permissionsCheck } from './resources/permissionsCheck';
import { msgPermsCheck } from './resources/msgPermCheck';
import { Events } from './events/Events';
import { SlashCommand } from './slashcommands/SlashCommand';
import { SlashCommands } from './slashcommands/SlashCommands';
import { Keyword } from './keywords/Keyword';
import { Keywords } from './keywords/Keywords';
import { MessageCommand } from './messagecommands/MessageCommand';
import { MessageCommands } from './messagecommands/MessageCommands';
import Enmap from 'enmap';
import cron from 'node-cron';
import { birthdays, birthdayChannels } from './slashcommands/Birthday';

export class Bot {
	public logger: CustomLogger;

	//helper functions
	public permissionsCheck = permissionsCheck;
	public msgPermsCheck = msgPermsCheck;

	//data stores
	public slashCommands: Array<SlashCommand> = SlashCommands;
	public messageCommands: Array<MessageCommand> = MessageCommands;
	public keywords: Array<Keyword> = Keywords;
	public songRecs: Enmap = new Enmap({ name: 'songs' });

	constructor(
		private token: string,
		public client: Client,
		public prefix: string,
		public mode: string,
		public test_server: string
	) {
		//initialize logger
		let now = new Date();
		//have the logs sit outside the built directory as it gets removed during building
		let logfileName = `./logs/${
			now.getMonth() + 1
		}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
		let logLevel: TLogLevelName = this.mode == 'debug' ? 'debug' : 'info';
		this.logger = new CustomLogger(logfileName, logLevel);

		//fetch enmaps
		this.songRecs.fetchEverything();
	}

	public async start(): Promise<void> {
		await this.logger.initialize();
		this.logger.info('Logging initialized');

		this.registerEvents();

		this.client.login(this.token);
	}

	registerEvents() {
		for (let event of Events) {
			// bind the process function for each event class to its respective event
			this.client.on(event.eventName, event.process.bind(null, this));
		}
	}

	async scheduleBirthdays() {
		cron.schedule('* * * * *', async () => {
			this.logger.debug('-----------------------------');
			let time = new Date();
			let currentTime = `${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
			let today = new Date();
			let todaysDate = `${today.getDate()}-${today.getMonth() + 1}`;
			this.logger.debug(todaysDate, currentTime);
			birthdays.forEach(async (bday, userId) => {
				this.logger.debug(bday, userId);
				let stringId = userId.toString();
				if (todaysDate == bday) {
					birthdayChannels.forEach(async (birthChannel, birthGuild) => {
						//TODO: If bot cannot send message, crash
						//TODO: If bot is not in server, crash
						let guild = this.client.guilds.cache.get(birthGuild.toString())!;
						this.logger.debug(guild.id);
						let bdayUser = this.client.users.cache.get(stringId);
						this.logger.debug(bdayUser);
						if (!(await guild.members.fetch(stringId))) return; //if the user is not a member in the guild, end
						let channel = this.client.channels.cache.get(
							birthChannel.toString()
						) as TextChannel;
						if (!channel) return; //if the channel doesnt exist, or mirror cannot see it, end
						await channel.send('Happy Birthday');
					});
				}
			});
		});
	}
}
