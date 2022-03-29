import Enmap from "enmap";
import { Bot } from "../Bot";
import cron from 'node-cron';

export const guildTimers = new Enmap('guildTimers');

export async function scheduleTimer(guild: string, bot:Bot, timer: Object): Promise<void> {
    try{
        //tets
        return console.log(timer);
        let infoString = guildTimers.ensure(guild, []);
        if(infoString.length == 0){
            bot.logger.info(`No timers available for guild: ${guild}.`);
            return;
        }
        let infoArray = infoString.split('-');
        let cronTime = `${infoArray[0]} ${infoArray[1]} * * *`;

        let task = cron.schedule(cronTime, async() => {
        	//this will run daily at the specified time:
            //create a day object, ensure that Mirror knows what date to scan
            let today = new Date();
            let dayString = new String();
            let dateMod = infoArray[2];
            if (dateMod == 'x') today.setDate(today.getDate());
            if (dateMod == 'minus') today.setDate(today.getDate() - 1); //yes these look weird but the Date fxn is smart enough to make the adjustment between months/years
            if (dateMod == 'plus') today.setDate(today.getDate() + 1);
            dayString = `${today.getDate()}-${today.getMonth() + 1}`;
        })
    } catch (err){
        bot.logger.error(guild, "scheduleTimer", err);
        return;
    }
}