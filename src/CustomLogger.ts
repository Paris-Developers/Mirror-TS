import { ILogObj, ILogObjMeta, Logger, TLogLevelName } from 'tslog';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import { Bot } from './Bot';
import { EmbedBuilder } from 'discord.js';
import config from './resources/config';

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
		//JSON.stringify turns an Error into {}, so pull the useful fields out first.
		//it also throws on a bigint or an object that refers back to itself (a queue or a track does),
		//which would drop the whole line from the file, so those are written as plain text instead
		const seen = new WeakSet<object>();
		const serialized = JSON.stringify(logObject, (_key, value) => {
			if (value instanceof Error)
				return { name: value.name, message: value.message, stack: value.stack };
			if (typeof value == 'bigint') return value.toString();
			if (typeof value == 'object' && value !== null) {
				if (seen.has(value)) return '[Circular]';
				seen.add(value);
			}
			return value;
		});
		appendFile(this.savePath, serialized + '\n').catch(
			(err) => console.log(err) //something is wrong in logging, print directly to console
		);
	}

	//commands call this from their catch and answer the person afterwards, so it must never throw:
	//a throw here used to hide the real error and skip that answer, leaving them on "Mirror is thinking..."
	commandError(channelId: string, commandName: string, ...args: unknown[]) {
		//log first, so the real error is on record even if posting it to Discord goes wrong
		const logged = this.error(`Command ${commandName} failed:`, ...args);
		if (!commandName) return logged;
		try {
			const embed = new EmbedBuilder()
				.setTitle(`Error in command: __${commandName.toUpperCase()}__`)
				.setColor('Red');
			//an embed's description can't be longer than 4096 characters, and a longer one throws
			const message = args.join(' ').slice(0, 4000);
			if (channelId) {
				embed.setDescription(`Error Message: ${message}\n\n Channel: <#${channelId}>`);
			} else {
				embed
					.setFooter({
						text: `Channel: ${channelId} (may not have been recieved)`,
					})
					.setDescription(`Error Message: ${message}`);
			}
			const errorChannel = this.bot.client.channels.cache.get(config.error_channel);
			if (errorChannel?.isSendable()) {
				errorChannel
					.send({ embeds: [embed] })
					.catch((err) => this.warn('Could not post a command error to the error channel:', err));
			} else {
				this.warn(`The error channel ${config.error_channel} isn't a channel Mirror can post in`);
			}
		} catch (err) {
			this.warn('Could not report a command error to the error channel:', err);
		}
		return logged;
	}
}
