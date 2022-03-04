import { ILogObject, Logger, TLogLevelName } from 'tslog';
import { appendFile } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { Bot } from './Bot';
import { MessageEmbed, TextChannel } from 'discord.js';

export class CustomLogger extends Logger {
	constructor(
		private savePath: string,
		private saveLevel: TLogLevelName,
		private bot: Bot
	) {
		super({
			minLevel: saveLevel,
		});
	}

	async initialize() {
		//only attach the logging to file function after the directory has been created
		await mkdirp(path.dirname(this.savePath));
		//bind the transport function so we can access the savePath from this
		const boundTransport = this.logToTransport.bind(this);

		//attach all transports
		this.attachTransport(
			{
				silly: boundTransport,
				debug: boundTransport,
				trace: boundTransport,
				info: boundTransport,
				warn: boundTransport,
				error: boundTransport,
				fatal: boundTransport,
			},
			this.saveLevel
		);
	}

	logToTransport(logObject: ILogObject) {
		appendFile(this.savePath, JSON.stringify(logObject) + '\n', (err) => {
			if (err) console.log(err); //something is wrong in logging, print directly to console
		});
	}

	error(
		channelId: string | undefined,
		commandName: string | undefined,
		...args: unknown[]
	): ILogObject {
		if (commandName) {
			const embed = new MessageEmbed()
				.setTitle(`Error in command ${commandName}`)
				.setDescription(`Error Message: ${args.join(' ')}`)
				.setFooter({ text: `Channel: ${channelId}` });
			let channel = this.bot.client.channels.cache.get(
				'948246919828865086'
			) as TextChannel;
			channel.send({ embeds: [embed] });
		}
		return super.error(args);
	}
}
