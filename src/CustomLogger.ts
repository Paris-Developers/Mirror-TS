import { ILogObj, ILogObjMeta, Logger, TLogLevelName } from 'tslog';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import { inspect } from 'util';
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
			//secrets are hidden before anything is written: in the console output (which the service saves
			//to logs\service-output.log) and in the log file alike. tslog does this on a copy of each thing
			//logged, errors included, down through every property. the copy shows properties discord.js
			//normally keeps out of sight (like .client), so log a name or an id, not a whole discord object
			mask: {
				//the value of a property with one of these names, at any depth. a discord.js Client keeps
				//the bot token in .token, and request headers hold authorization and cookie
				keys: [
					'token',
					'authorization',
					'cookie',
					'set-cookie',
					'youtube_cookie',
					'nasa_token',
					'stock_token',
					'weather_token',
				],
				caseInsensitive: true,
				regex: [
					//a DiscordAPIError prints the url it was sent to, and a reply's url holds the interaction's
					//token, which can answer as Mirror for 15 minutes: .../interactions/<id>/<token>/callback
					//and .../webhooks/<application id>/<token>/messages/... only the token part is hidden
					/(?<=\/(?:interactions|webhooks)\/\d+\/)[^/?#\s'"\\]+/g,
					//a bot token written out as text. it is only looked for where a run of letters starts: tried
					//from every letter, one long run (a blob of base64 in an error) took seconds and froze the bot
					/(?<![\w-])[\w-]{24,}\.[\w-]{6}\.[\w-]{27,}/g,
					//the keys /nasa, /weather and /stock put in the urls they fetch
					/(?<=[?&](?:api_key|appid|token)=)[^&#\s'"\\]+/gi,
				],
			},
		});
	}

	async initialize() {
		//only attach the logging to file function after the directory has been created
		await mkdir(path.dirname(this.savePath), { recursive: true });
		//the transport only receives logs at or above the logger's minLevel, already masked (see above)
		this.attachTransport((logObject) => this.logToTransport(logObject));
	}

	logToTransport(logObject: ILogObj & ILogObjMeta) {
		//JSON.stringify turns an Error into {}, so pull the useful fields out first.
		//it also throws on a bigint or an object that refers back to itself (a queue or a track does),
		//which would drop the whole line from the file, so those are written as plain text instead
		const seen = new WeakSet<object>();
		let serialized: string;
		try {
			serialized = JSON.stringify(logObject, (_key, value) => {
				if (value instanceof Error)
					return { name: value.name, message: value.message, stack: value.stack };
				if (typeof value == 'bigint') return value.toString();
				if (typeof value == 'object' && value !== null) {
					if (seen.has(value)) return '[Circular]';
					seen.add(value);
				}
				return value;
			});
		} catch {
			//the masked copy tslog hands over (see mask above) shows a discord object's .client, and the
			//object's own toJSON then goes round in circles before the check above sees it. rather than
			//lose the line, each part of it is written out as text
			const meta = this.settings.meta.property;
			serialized = JSON.stringify(
				Object.fromEntries(
					Object.entries(logObject).map(([key, value]) => [
						key,
						key == meta || typeof value == 'string'
							? value
							: inspect(value, { depth: 3, breakLength: Infinity }),
					])
				)
			);
		}
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
						text: 'Channel unknown (it may not have been received)',
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
