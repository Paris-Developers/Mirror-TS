import { bdayTimes } from '../slashcommands/Birthday';

export async function birthdayTimer(guild: string): Promise<void> {
	let infoString = bdayTimes.ensure(guild, '');
	if (infoString == '') {
		return console.log(`Embed value did not exist for guild: ${guild}.`);
	}
	infoString = infoString.split('-'); //[0]=MM [1]=HH [2]=DATEMOD [3]=Timezone for notes
	let cronTime = `${infoString[0]} ${infoString[1]} * * *`;
	let today = new Date();
	let day = new Number();
	let dateMod = infoString[2];
	if (dateMod == 'x') today.setDate(today.getDate());
	if (dateMod == 'minus') today.setDate(today.getDate() - 1);
	if (dateMod == 'plus') today.setDate(today.getDate() + 1);
	day = today.getDate();
	let month = today.getMonth() + 1;
}
