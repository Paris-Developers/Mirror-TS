import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		bot.registerSlashCommands();
		bot.scheduleBirthdays();
		bot.client.user?.setActivity(' lofi | /help', {
			type: 'LISTENING',
		});
	}
}
