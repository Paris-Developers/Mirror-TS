//Call: Slash command weather or w
//Returns weather from a single specified city

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	Permissions,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import fetch from 'node-fetch';
import { find } from 'geo-tz';
import config from '../../config.json';

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

export class Weather implements SlashCommand {
	name: string = 'weather';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Weather data',
		options: [
			{
				name: 'city',
				type: 'STRING',
				description: 'City to query',
				required: true,
			},
			{
				name: 'state',
				type: 'STRING',
				description: 'Two letter state code',
				required: false,
			},
		],
	};
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		if (!interaction.options.getString('city')) {
			const embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setDescription('Empty message, please provide a city');
			interaction.reply({ embeds: [embed] });
			return;
		}
		//if it encounters an error it will run the code under the catch function
		let jsonData;
		try {
			let query = interaction.options.getString('state') //if we have a state lets add it to the string
				? `${interaction.options.getString(
						'city'
				  )},US-${interaction.options.getString('state')}`
				: interaction.options.getString('city');
			//Pulls data from the API and stores as a JSON object
			let res = await fetch(
				`http://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${config.weather_token}`
			);
			jsonData = await res.json();

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
			let cityArray = interaction.options.getString('city')!.split(' ');
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

			//sends embed to the channel
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			//prints the error message
			if (jsonData.cod == '404') {
				bot.errorLog(interaction.channelId,this.name,`${err}`)
				const embed = new MessageEmbed()
					.setColor('#FFFFFF')
					.setDescription(`Error: City not found, try again`);
				interaction.reply({ embeds: [embed] });
				return;
			}
			const embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setDescription(`Error: ${err}`);
			interaction.reply({ embeds: [embed] });
		}
	}
}
