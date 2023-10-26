import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayTimes } from '../slashcommands/BirthdayConfig';
import { birthdayTimer } from '../resources/birthdayTimer';
import { registerSlashCommands } from '../resources/registerSlashCommands';
import { launchVoice } from '../slashcommands/DefaultVc';
import config from '../../config.json';
import { ActivityType, TextChannel } from 'discord.js';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		await registerSlashCommands(bot);
		bot.client.user?.setActivity(config.message, {
			type: ActivityType.Listening,
		});
		bdayTimes.forEach(async (info, guild) => {
			birthdayTimer(guild.toString(), bot);
		});
		launchVoice(bot);
		let now = new Date();
		let channel = bot.client.channels.cache.get(config.error_channel) as TextChannel;
		channel.send(`Mirror started at ${now.getHours()}:${now.getMinutes()} in ${config.mode} mode, live in ${bot.client.guilds.cache.size} servers`);
	}
}
