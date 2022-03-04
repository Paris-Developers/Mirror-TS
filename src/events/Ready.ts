import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayTimes } from '../slashcommands/Birthday';
import { birthdayTimer } from '../resources/birthdayTimer';
import { registerSlashCommands } from '../resources/registerSlashCommands';

export class Ready implements EventHandler {
	eventName = 'ready';
	async process(bot: Bot): Promise<void> {
		bot.logger.info('Logged in');
		await registerSlashCommands(bot);
		bot.client.user?.setActivity(' lofi | /help', {
			type: 'LISTENING',
		});
		bdayTimes.forEach(async (info, guild) => {
			birthdayTimer(guild.toString(), bot);
		});
		bot.launchVoice();
	}
}

