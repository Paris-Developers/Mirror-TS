//Call: Slash command weather
//Returns weather from a single specified city

import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { find } from 'geo-tz';
import config from '../resources/config';
import { Option, Subcommand } from './Option';
import { colorCheck } from '../resources/embedColorCheck';
import { respond } from '../resources/respond';

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
	description: string = 'Weather data for a provided city';
	options: (Option | Subcommand)[] = [
		new Option(
			'city',
			'City to query',
			ApplicationCommandOptionType.String,
			true
		),
		new Option(
			'state',
			'Two letter state code',
			ApplicationCommandOptionType.String,
			false
		),
	];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			if (!interaction.options.getString('city')) {
				const embed = new EmbedBuilder()
					.setColor(colorCheck(interaction.guild!.id))
					.setDescription('Empty message, please provide a city');
				interaction.reply({ embeds: [embed] });
				return;
			}
			//if it encounters an error it will run the code under the catch function
			let jsonData;

			//a city with a space or an ampersand in it has to be escaped, or it breaks the query string
			let city = encodeURIComponent(interaction.options.getString('city')!);
			let state = interaction.options.getString('state');
			let query = state //if we have a state lets add it to the string
				? `${city},US-${encodeURIComponent(state)}`
				: city;
			//Pulls data from the API and stores as a JSON object
			let res = await fetch(
				`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${config.weather_token}`
			);
			jsonData = await res.json();
			if (jsonData.cod == '404') {
				const embed = new EmbedBuilder()
					.setColor(colorCheck(interaction.guild!.id))
					.setDescription(`Error: City not found, try again`);
				interaction.reply({ embeds: [embed] });
				return;
			}
			//define current weather coniditions
			let condition = jsonData.weather[0].main;

			//define current temperatures
			let cTemp = Math.round(jsonData.main.temp - 273.15);
			let fTemp = Math.round((cTemp * 9) / 5 + 32);

			//define daily high temperatures
			let cHigh = Math.round(jsonData.main.temp_max - 273.15);
			let fHigh = Math.round((cHigh * 9) / 5 + 32);

			//define timezone, sunrise and sunset. cutting the formatted date to four characters turned
			//11:05 AM into "11:0" and dropped the AM from every time, so ask for just the clock time
			let timezone = find(jsonData.coord.lat, jsonData.coord.lon);
			let clock = (seconds: number) =>
				new Date(seconds * 1000).toLocaleTimeString('en-US', {
					timeZone: timezone[0],
					hour: 'numeric',
					minute: '2-digit',
				});
			let sunrise = clock(jsonData.sys.sunrise);
			let sunset = clock(jsonData.sys.sunset);

			//define humidity and wind ## NOTE WIND COMES IN AT M/S
			let humidity = `${jsonData.main.humidity} %`;
			let kmhWind = Math.round(jsonData.wind.speed * 3.6);
			let mphWind = Math.round(kmhWind * 0.621371);
			//the compass has 16 points, so each one covers 22.5 degrees, not 22.8
			let windDir =
				mphWind == 0 ? '' : cardinalDir[Math.round(jsonData.wind.deg / 22.5)]; // if there's no wind, set it to blank

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
			const embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
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
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
}
