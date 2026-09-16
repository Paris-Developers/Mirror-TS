import { ILogObj, ILogObjMeta, Logger, TLogLevelName } from 'tslog';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import { Bot } from './Bot';
import { Channel, EmbedBuilder, TextChannel } from 'discord.js';
import config from '../config.json';

export class CustomLogger extends Logger<ILogObj> {
	constructor(
		private savePath: string,
		saveLevel: TLogLevelName,
		private bot: Bot
	) {
		super({
			minLevel: saveLevel,
		});
	}

	async initialize() {
		//only attach the logging to file function after the directory has been created
		await mkdir(path.dirname(this.savePath), { recursive: true });
		//the transport only receives logs at or above the logger's minLevel
		this.attachTransport((logObject) => this.logToTransport(logObject));
	}

	logToTransport(logObject: ILogObj & ILogObjMeta) {
		//JSON.stringify turns an Error into {}, so pull the useful fields out first
		const serialized = JSON.stringify(logObject, (_key, value) =>
			value instanceof Error
				? { name: value.name, message: value.message, stack: value.stack }
				: value
		);
		appendFile(this.savePath, serialized + '\n').catch(
			(err) => console.log(err) //something is wrong in logging, print directly to console
		);
	}

	commandError(channelId: string, commandName: string, ...args: unknown[]) {
		if (commandName) {
			var errorChannel: Channel;

			const embed = new EmbedBuilder()
				.setTitle(`Error in command: __${commandName.toUpperCase()}__`)
				.setColor('Red');
			if (channelId) {
				errorChannel = this.bot.client.channels.cache.get(channelId) as Channel;
				embed.setDescription(
					`Error Message: ${args.join(' ')}\n\n Channel: ${errorChannel}`
				);
			} else {
				embed
					.setFooter({
						text: `Channel: ${channelId} (may not have been recieved)`,
					})
					.setDescription(`Error Message: ${args.join(' ')}`);
			}
			let channel = this.bot.client.channels.cache.get(
				config.error_channel
			) as TextChannel;
			channel.send({ embeds: [embed] });
		}
		return this.error(args);
	}
}
