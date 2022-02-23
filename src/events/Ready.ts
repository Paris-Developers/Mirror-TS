import { EventHandler } from './EventHandler';
import { Bot } from '../Bot';
import { bdayChannels, bdayDates, bdayTimes } from '../slashcommands/Birthday';
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
		//bdayChannels.deleteAll();
		//bdayDates.deleteAll();
		//bdayTimes.deleteAll();

		bdayTimes.forEach(async (info, guild) => {
			console.log(guild.toString());
			birthdayTimer(guild.toString(), bot);
		});
	}
}
