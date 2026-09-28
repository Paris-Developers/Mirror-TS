import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayTimes } from '../slashcommands/BirthdayConfig';
import { birthdayTimer } from '../resources/birthdayTimer';
import { registerSlashCommands } from '../resources/registerSlashCommands';
import { launchVoice, watchDefaultVoice } from '../slashcommands/DefaultVc';
import config from '../resources/config';
import { ActivityType } from 'discord.js';
import { handledHere } from '../resources/instanceGuard';

export class Ready implements EventHandler {
	eventName = 'clientReady';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		//each step runs on its own, so one that fails (a slow command sync, a missing error channel)
		//doesn't stop the ones after it
		const step = async (name: string, run: () => unknown) => {
			try {
				await run();
			} catch (error) {
				bot.logger.error(`Startup step "${name}" failed:`, error);
			}
		};
		//voice goes first and doesn't wait: syncing commands with Discord can be slow, and joining
		//the default channels doesn't depend on it
		watchDefaultVoice(bot);
		void step('default voice channels', () => launchVoice(bot));
		await step('slash commands', () => registerSlashCommands(bot));
		await step('status', () =>
			bot.client.user?.setActivity(config.message, {
				type: ActivityType.Listening,
			})
		);
		await step('birthday timers', () => {
			for (const guild of bdayTimes.keys()) {
				if (handledHere(bot, String(guild))) birthdayTimer(guild, bot);
			}
		});
		await step('startup message', async () => {
			let now = new Date();
			let channel = bot.client.channels.cache.get(config.error_channel);
			if (!channel?.isSendable()) throw new Error(`the error channel ${config.error_channel} can't be found or written to`);
			//the machine's name stays in the log file, where it is just as good for spotting a second
			//copy, rather than being posted to a Discord channel at every start
			await channel.send(`Mirror started at ${now.getHours()}:${now.getMinutes()} in ${config.mode} mode, live in ${bot.client.guilds.cache.size} servers`);
		});
	}
}
