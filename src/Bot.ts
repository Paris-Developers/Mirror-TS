import { Client, Guild, MessageEmbed, TextChannel } from 'discord.js';
import { CustomLogger } from './CustomLogger';
import { TLogLevelName } from 'tslog';
import { permissionsCheck } from './resources/permissionsCheck';
import { msgPermsCheck } from './resources/msgPermCheck';
import { Events } from './events/Events';
import { SlashCommand } from './slashcommands/SlashCommand';
import { Keyword } from './keywords/Keyword';
import { MessageCommand } from './messagecommands/MessageCommand';
import {
	importSlashCommands,
	importMessageCommands,
	importKeywords,
} from './resources/dynamicImports';
import Enmap from 'enmap';
import { registerEvents } from './resources/registerEvents';
import { defaultVc } from './slashcommands/DefaultVc';
import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import { ConnectionVisibility } from 'discord-api-types';

export class Bot {
	public logger: CustomLogger;

	//helper functions
	public permissionsCheck = permissionsCheck;
	public msgPermsCheck = msgPermsCheck;

	//data stores
	public slashCommands: Array<SlashCommand> = [];
	public messageCommands: Array<MessageCommand> = [];
	public keywords: Array<Keyword> = [];
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
		await registerEvents(this);
		await importSlashCommands(this);
		await importMessageCommands(this);
		await importKeywords(this);
		this.client.login(this.token);
	}

	public async errorLog(channelId:string, commandName:string, errText:string): Promise<void> {
		const embed = new MessageEmbed()
			.setTitle(`Error in command ${commandName}`)
			.setDescription(`Error Message: ${errText}`)
			.setFooter({text:`Channel: ${channelId}`});
		let channel = this.client.channels.cache.get('948246919828865086') as TextChannel;
		await channel.send({embeds:[embed]});
	}

	public async launchVoice(): Promise<void> {
		defaultVc.forEach((channel,guild) => {
			let guildCheck = this.client.guilds.cache.get(guild.toString()) as Guild;
			const connection = joinVoiceChannel({
				channelId: channel,
				guildId: guildCheck.id,
				adapterCreator: guildCheck.voiceAdapterCreator,
			});
			let player = createAudioPlayer();
			connection.subscribe(player)
		})
	}
}
