import { bdayDates, bdayTimes, bdayChannels } from '../slashcommands/Birthday';
import cron from 'node-cron';
import { Bot } from '../Bot';
import { MessageEmbed, TextChannel, User } from 'discord.js';

export async function birthdayTimer(guild: string, bot: Bot): Promise<void> {
	let guildId = guild;
	let infoString = bdayTimes.ensure(guild, '');
	if (infoString == '') {
		return console.log(`Embed value did not exist for guild: ${guild}.`); //TODO: change to logger?
	}
	infoString = infoString.split('-'); //[0]=MM [1]=HH [2]=DATEMOD [3]=Timezone for notes
	let cronTime = `${infoString[0]} ${infoString[1]} * * *`;

	cron.schedule(cronTime, async () => {
		/*We are now in the cronJob for a server. here is the list of the things we need to do in here or another fxn
		- Loop through the dates
		- If a date matches the current date, check if the users are in the server
		- If they are in the server, run the message
		*/
		let today = new Date();
		let dayString = new String();
		let dateMod = infoString[2];
		if (dateMod == 'x') today.setDate(today.getDate());
		if (dateMod == 'minus') today.setDate(today.getDate() - 1); //yes these look weird but the Date fxn is smart enough to make the adjustment between months/years
		if (dateMod == 'plus') today.setDate(today.getDate() + 1);
		dayString = `${today.getDate()}-${today.getMonth}`;
		bdayDates.forEach(async (bday, userId) => {
			let stringID = userId.toString();
			if (dayString == bday) {
				//if a persons birthday matches the current date we are checking, run this!
				let targetChannel = bot.client.channels!.cache.get(
					bdayChannels.get(guildId)
				) as TextChannel;
				if (!targetChannel) return;
				let user = bot.client.users!.cache.get(userId.toString()) as User;
				const bdayEmbed = new MessageEmbed().setTitle(
					`**Happy Birthday ${user.tag} :tada:**`
				);
				await targetChannel.send({ embeds: [bdayEmbed] });
			}
		});
	});
}
