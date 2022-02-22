import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayTimes } from '../slashcommands/Birthday';
import { birthdayTimer } from '../resources/birthdayTimer';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		bot.registerSlashCommands();
		bot.client.user?.setActivity(' lofi | /help', {
			type: 'LISTENING',
		});
		bdayTimes.forEach(async (info) => {
			birthdayTimer(info, bot);
		});
	}
}
