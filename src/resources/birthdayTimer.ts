import { bdayDates, bdayTimes, bdayChannels } from '../slashcommands/Birthday';
import cron from 'node-cron';
import { Bot } from '../Bot';
import { MessageEmbed, TextChannel, User } from 'discord.js';
import Enmap from 'enmap';

export let bdayCrons = new Enmap('bdayCrons');

export async function birthdayTimer(guild: string, bot: Bot): Promise<void> {
	//grab the stored infostring from the enmap, if empty: return
	let infoString = bdayTimes.ensure(guild, '') as String;
	if (infoString == '') {
		bot.logger.warn(`Embed value did not exist for guild: ${guild}.`); 
		return;
	}
	//split the infoarray to be interpreted and interpolate the cron string to be accurate
	let infoArray = infoString.split('-'); //[0]=MM [1]=HH [2]=DATEMOD [3]=Timezone for notes
	let cronTime = `${infoArray[0]} ${infoArray[1]} * * *`;
	console.log(infoArray);

	//if a cronJob already exists for a guild we will want to end it before scheduling a new one.
	let task = bdayCrons.get(guild);
	if (!task) {
	} else {
		bot.logger.warn('unscheduling cron!');
		task.stop();
	}

	//schedule a new cron into task
	task = cron.schedule(cronTime, async () => {
		//this will run daily at the specified time:
		//create a day object, ensure that Mirror knows what date to scan
		let today = new Date();
		let dayString = new String();
		let dateMod = infoArray[2];
		if (dateMod == 'x') today.setDate(today.getDate());
		if (dateMod == 'minus') today.setDate(today.getDate() - 1); //yes these look weird but the Date fxn is smart enough to make the adjustment between months/years
		if (dateMod == 'plus') today.setDate(today.getDate() + 1);
		dayString = `${today.getDate()}-${today.getMonth() + 1}`;

		//for every birthday in the enmap, check if it matches the current date
		bdayDates.forEach(async (bday, userId) => {
			console.log( //TODO: remove this eventually, keep in PR for now
				`Looping, user: ${userId}, bday ${bday}, server ${guild}, current date: ${dayString}`
			);

			//if a persons birthday matches the current date we are checking
			if (dayString == bday) {
				//TODO: check if the user exists in the guild


				//check if the channel exists
				let targetChannel = bot.client.channels!.cache.get(
					bdayChannels.get(guild)
				) as TextChannel;
				if (!targetChannel) return;

				//import user object
				let user = bot.client.users!.cache.get(userId.toString()) as User;

				//create embed and send
				const bdayEmbed = new MessageEmbed().setTitle(
					`**Happy Birthday ${user.tag} :tada:**`
				);
				await targetChannel.send({ embeds: [bdayEmbed] });
			}
		});
	});
	//set task as the current cronJob for the guild
	bdayCrons.set(guild, task);
}
