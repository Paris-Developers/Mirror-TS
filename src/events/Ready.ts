import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayTimes } from '../slashcommands/BirthdayConfig';
import { birthdayTimer } from '../resources/birthdayTimer';
import { registerSlashCommands } from '../resources/registerSlashCommands';
import { launchVoice } from '../slashcommands/DefaultVc';
import config from '../../config.json';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		await registerSlashCommands(bot);
		bot.client.user?.setActivity(config.message, {
			type: 'LISTENING',
		});
		bdayTimes.forEach(async (info, guild) => {
			birthdayTimer(guild.toString(), bot);
		});
		launchVoice(bot);
	}
}
