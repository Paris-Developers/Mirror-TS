import Enmap from 'enmap';
import { Bot } from '../Bot';
import cron from 'node-cron';
import { Channel, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import { weatherEmbed } from './embed constructors/weatherEmbed';

export const guildTimers = new Enmap('guildTimers');

export async function scheduleTimer(
	guildID: string,
	bot: Bot,
	timer: object
): Promise<void> {
	try {
		let timerArray = Object.values(timer);
		const min = timerArray[0] as number;
		const hour = timerArray[1] as number;
		let channel = timerArray[4];
		let type = timerArray[6] as string;
		const query = timerArray[7] as string;
		let cronTime = `${timerArray[0]} ${timerArray[1]} * * *`;

		let task = cron.schedule(cronTime, async () => {
			var embed: MessageEmbed;
			if (type == 'weather') {
				embed = await weatherEmbed(bot, query);
			}
			if (type == 'stock') {
				return;
			}
			if (type == 'nasa') {
				return;
			}
			channel.message.send(embed!);
			return;
		});
	} catch (err) {
		bot.logger.error(guildID, 'scheduleTimer', err);
		return;
	}
}
