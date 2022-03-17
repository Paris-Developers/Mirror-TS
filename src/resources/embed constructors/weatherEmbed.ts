import { DiscordAPIError, MessageEmbed } from "discord.js";
import { find } from 'geo-tz';
import config from '../../../config.json'
import { Bot } from '../../Bot'

//Here is an example embed constructor.It would simplify things if we passed
//an interaction but because we are potentially using these for timers we cannot.
//this will force us to have all of the error testing for the APIs in the constructor.
//it only takes in the bot object and returns an embed upon completion.

type cardinalIndex = { [index: number]: string };
const cardinalDir = {
	0: 'N',
	1: 'NNE',
	2: 'NE',
	3: 'ENE',
	4: 'E',
	5: 'ESE',
	6: 'SE',
	7: 'SSE',
	8: 'S',
	9: 'SSW',
	10: 'SW',
	11: 'WSW',
	12: 'W',
	13: 'WNW',
	14: 'NW',
	15: 'NNW',
	16: 'N',
} as cardinalIndex;

type emojiConverter = { [index: string]: string };
const weatherEmoji = {
	Rain: ':cloud_rain:',
	Thunderstorm: ':thunder_cloud_rain:',
	Drizzle: ':cloud_rain:',
	Snow: ':cloud_snow:',
	Clear: ':sunny:',
	Clouds: ':cloud:',
	Mist: ':fog:',
} as emojiConverter;

export async function weatherEmbed(bot: Bot, query: string): Promise<MessageEmbed>{
    try{
        //if it encounters an error it will run the code under the catch function
        //Pulls data from the API and stores as a JSON object
        let jsonData;
        let res = await fetch(
            `http://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${config.weather_token}`
        );
        jsonData = await res.json();
        if (jsonData.cod == '404') {
            const embed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setDescription(`Error: City not found, try again`);
            return embed;
        }
        //define current weather coniditions
        let condition = jsonData.weather[0].main;

        //define current temperatures
        let cTemp = Math.round(jsonData.main.temp - 273.15);
        let fTemp = Math.round((cTemp * 9) / 5 + 32);

        //define daily high temperatures
        let cHigh = Math.round(jsonData.main.temp_max - 273.15);
        let fHigh = Math.round((cHigh * 9) / 5 + 32);

        //define timezone and sunrise
        let timezone = find(jsonData.coord.lat, jsonData.coord.lon);
        let sunrise = new Date(jsonData.sys.sunrise * 1000).toLocaleString(
            'en-US',
            { timeZone: timezone[0] }
        );
        sunrise = sunrise.split(', ')[1].slice(0, 4);

        //define sunset
        let sunset = new Date(jsonData.sys.sunset * 1000).toLocaleString(
            'en-US',
            {
                timeZone: timezone[0],
            }
        );
        sunset = sunset.split(', ')[1].slice(0, 4);

        //define humidity and wind ## NOTE WIND COMES IN AT M/S
        let humidity = `${jsonData.main.humidity} %`;
        let kmhWind = Math.round(jsonData.wind.speed * 3.6);
        let mphWind = Math.round(kmhWind * 0.621371);
        let windDir =
            mphWind == 0 ? '' : cardinalDir[Math.round(jsonData.wind.deg / 22.8)]; // if there's no wind, set it to blank

        //capitalizes the first letter of each word in the string called
        let str = '';
        let cityArray = query.split(' ');
        for (let step = 0; step < cityArray.length; step++) {
            str +=
                cityArray[step][0].toUpperCase() +
                cityArray[step].slice(1).toLowerCase() +
                ' ';
        }
        //creates message embed and edits modifiers
        const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setTitle(`**Current Weather in ${str}**`)
            .addFields(
                //adds multiple embed fields simultaneously
                {
                    name: `Temp: ${fTemp}°F (${cTemp}°C) \nHigh: ${fHigh}°F (${cHigh}°C)`,
                    value: `${condition} ${weatherEmoji[condition]}`,
                    inline: false,
                },
                {
                    name: 'Wind:',
                    value: `${mphWind} mph (${kmhWind} kmh) \n${windDir}`,
                    inline: true,
                },
                {
                    name: 'Daylight:',
                    value: `:sun_with_face: ${sunrise}\n:new_moon_with_face: ${sunset}`,
                    inline: true,
                },
                { name: 'Humidity:', value: `${humidity}`, inline: true }
            )
            .setTimestamp();
            return embed;
    } catch (err){
        bot.logger.error(undefined, "weatherEmbed", err)
        const embed = new MessageEmbed()
            .setDescription("Error contact a developer to investigate");
        return embed;

    }
}