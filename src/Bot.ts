import { Client, Guild, EmbedBuilder, TextChannel, Events } from 'discord.js';
import { hostname } from 'os';
import { CustomLogger } from './CustomLogger';
import { TLogLevelName } from 'tslog';
import { permissionsCheck } from './resources/permissionsCheck';
import { msgPermsCheck } from './resources/msgPermCheck';
import { SlashCommand } from './slashcommands/SlashCommand';
import { Keyword } from './keywords/Keyword';
import { MessageCommand } from './messagecommands/MessageCommand';
import {
	importSlashCommands,
	importUserCommands,
	importMessageCommands,
	importKeywords,
} from './resources/dynamicImports';
import { UserCommand } from './usercommands/UserCommand';
import Enmap from 'enmap';
import { registerEvents } from './resources/registerEvents';
import { CustomPlayer } from './resources/CustomPlayer';
import { startMetrics } from './resources/metrics';
import { refusedExitCode, startupCheck } from './resources/instanceGuard';
import { checkVoiceDependencies } from './resources/voiceDependencies';

export class Bot {
	public logger: CustomLogger;
	public player: CustomPlayer;

	//helper functions
	public permissionsCheck = permissionsCheck;
	public msgPermsCheck = msgPermsCheck;

	//data stores
	public slashCommands: Array<SlashCommand> = [];
	public userCommands: Array<UserCommand> = [];
	public messageCommands: Array<MessageCommand> = [];
	public keywords: Array<Keyword> = [];
	public songRecs: Enmap = new Enmap({ name: 'songs' });

	constructor(
		private token: string,
		public client: Client,
		public prefix: string,
		public mode: string,
		public test_server: string,
		//the machine the live bot runs on, from config.json. optional, see startupCheck
		public production_host?: string
	) {
		//class fields initialize before constructor parameters are assigned, so the player
		//(which reads this.client) has to be created here rather than as a field
		this.player = new CustomPlayer(this);

		//initialize logger
		let now = new Date();
		//have the logs sit outside the built directory as it gets removed during building
		let logfileName = `./logs/${
			now.getMonth() + 1
		}-${now.getDate()}-${now.getFullYear()} ${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.log`;
		let logLevel: TLogLevelName = this.mode == 'debug' ? 'DEBUG' : 'INFO';
		this.logger = new CustomLogger(logfileName, logLevel, this);
	}

	public async start(): Promise<void> {
		await this.logger.initialize();
		this.logger.info('Logging initialized');
		if (!startupCheck(this)) {
			//this copy must not log in. the pause lets the reason reach the log file before exiting
			process.exitCode = refusedExitCode;
			setTimeout(() => process.exit(refusedExitCode), 1000);
			return;
		}
		//before anything connects out, so the stats count all of the bot's traffic
		startMetrics(this);
		await registerEvents(this);
		await importSlashCommands(this);
		await importUserCommands(this);
		await importMessageCommands(this);
		await importKeywords(this);
		await this.player.loadExtractors();
		await checkVoiceDependencies(this);
		//names the machine and the bot account together, so two copies logged in as the same bot show up
		this.client.once(Events.ClientReady, (client) =>
			this.logger.info(
				`Logged in as ${client.user.tag} (${client.user.id}) on ${hostname()} in ${this.mode} mode`
			)
		);
		this.client.login(this.token);
		this.player.registerPlayerEvents();
	}
}
