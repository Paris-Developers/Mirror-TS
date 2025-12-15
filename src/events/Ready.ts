import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayTimes } from '../slashcommands/BirthdayConfig';
import { birthdayTimer } from '../resources/birthdayTimer';

import { registerSlashCommands } from '../resources/registerSlashCommands';
import { launchVoice } from '../slashcommands/DefaultVc';
import config from '../../config.json';
import { TextChannel, ActivityType } from 'discord.js';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		await registerSlashCommands(bot);
		//set the bot status
		bot.client.user!.setActivity('to your cries', {
			type: ActivityType.Listening,
		});
		// Enmap iterator fix
		for (const [guild, info] of Array.from(bdayTimes.entries())) {
			await birthdayTimer(guild.toString(), bot);
		}
		launchVoice(bot);
		let now = new Date();
		let channel = bot.client.channels.cache.get(config.error_channel) as TextChannel;
		channel.send(`Mirror started at ${now.getHours()}:${now.getMinutes()} in ${config.mode} mode, live in ${bot.client.guilds.cache.size} servers`);
	}
}
