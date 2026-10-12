import { bdayDates } from '../slashcommands/Birthday';
import cron from 'node-cron';
import { Bot } from '../Bot';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { bdayChannels, birthdayTime, cronTimezone } from '../slashcommands/BirthdayConfig';
import { silenceCheck } from '../slashcommands/SilenceRole';

//running cron jobs can't be saved to disk, so they live in a plain Map
export let bdayCrons = new Map<string, ReturnType<typeof cron.schedule>>();

//returns whether the guild now has a running job, so a time node-cron won't take can be reported
//back to whoever set it instead of leaving the server with no timer at all
export async function birthdayTimer(guild: string, bot: Bot): Promise<boolean> {
	let time = birthdayTime(guild);
	if (!time) {
		bot.logger.info(`No usable birthday time saved for guild: ${guild}.`);
		return false;
	}
	let cronTime = `${time.minute} ${time.hour} * * *`;
	let timezone = cronTimezone(time.timezone);

	let task: ReturnType<typeof cron.schedule>;
	try {
		//node-cron keeps the job on the chosen timezone's wall clock, so 8:00 PST stays 8:00 PST
		//whatever the bot machine is set to, and daylight saving is handled for us
		task = cron.schedule(
			cronTime,
			async () => {
				//this will run daily at the specified time:
				//the date is read in the person's own timezone, since the bot machine's clock may
				//already be on the next day
				let today = localDate(timezone);
				let dayString = `${today.day}-${today.month}`;

				//for every birthday in the enmap, check if it matches the current date
				bdayDates.entries().forEach(async ([userId, bday]) => {
					//if a persons birthday matches the current date we are checking
					if (dayString == bday) {
						let birthGuild = bot.client.guilds.cache.get(guild);
						if (!birthGuild) return;
						try {
							var member = await birthGuild.members.fetch(userId.toString());
						} catch (err) {
							return;
						}

						//silenced members get no message, by role as well as by name
						if (silenceCheck(member)) return;

						//check if the channel exists
						let targetChannel = bot.client.channels!.cache.get(
							bdayChannels.get(guild)
						) as TextChannel;
						if (!targetChannel) return;

						//create embed and send
						const bdayEmbed = new EmbedBuilder()
							.setDescription(`**:birthday: Happy Birthday <@${userId}> :tada:**`)
							.setColor(member.displayHexColor)
							.setFooter({
								text: `${today.month}-${today.day}-${today.year}`,
								iconURL: member.displayAvatarURL(),
							});
						let message = await targetChannel.send({ embeds: [bdayEmbed] });
						await message.react('🥳');
					}
				});
			},
			{ timezone }
		);
	} catch (err) {
		bot.logger.error(`Could not schedule birthdays for guild ${guild}:`, err);
		return false;
	}

	//the running job is only replaced once the new one exists, so a time node-cron refuses leaves
	//the server with the timer it already had
	let previous = bdayCrons.get(guild);
	if (previous) previous.stop();
	bdayCrons.set(guild, task);
	return true;
}

function localDate(timezone: string): { day: number; month: number; year: number } {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: timezone,
		day: 'numeric',
		month: 'numeric',
		year: 'numeric',
	}).formatToParts(new Date());
	const part = (type: string) => Number(parts.find((found) => found.type === type)?.value);
	return { day: part('day'), month: part('month'), year: part('year') };
}
