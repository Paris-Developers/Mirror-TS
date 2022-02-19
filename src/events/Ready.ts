import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { registerSlashCommands } from '../resources/registerSlashCommands';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		await registerSlashCommands(bot);
		bot.scheduleBirthdays();
		bot.client.user?.setActivity(' lofi | /help', {
			type: 'LISTENING',
		});
	}
}
