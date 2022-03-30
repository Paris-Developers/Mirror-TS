import { Bot } from '../Bot';
import { EventHandler } from './EventHandler';

export class Error implements EventHandler {
	eventName: string = 'error';
	async process(bot: Bot, error: any): Promise<void> {
		bot.logger.error(error);
	}
}
