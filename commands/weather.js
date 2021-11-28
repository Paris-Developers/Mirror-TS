const fetch = require('node-fetch');
const {MessageEmbed} = require('discord.js');
const { find } = require('geo-tz');

const weatherEmoji = {"Rain":":cloud_rain:","Thunderstorm":":thunder_cloud_rain:","Drizzle":":cloud_rain:", "Snow":":cloud_snow:", "Clear":":sunny:", "Clouds":":cloud:"}
const cardinalDir = {0:"N",1:"NNE",2:"NE",3:"ENE",4:"E",5:"ESE",6:"SE",7:"SSE",8:"S",9:"SSW",10:"SW",11:"WSW",12:"W",13:"WNW",14:"NW",15:"NNW",16:"N"}

exports.run = async (client, message, args) => {
    let res = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${args}&appid=${client.config.weather_token}`);
    let jsonData = await  res.json();

    const embed = new MessageEmbed()
        .setTitle('**__Embed title test__** :skull:')
        .setAuthor('Fordle','https://i.imgur.com/pxkMn14.jpg?1');
    embed.color = 0xFFFFFF;
    


    let weatherString = '';
    weatherString += `Current Conditions: ${jsonData.weather[0].main} ${weatherEmoji[jsonData.weather[0].main]}\n`; 
    let cTemp = Math.round(jsonData.main.temp - 273.15);
    let fTemp = Math.round(cTemp * 9/5 + 32);
    weatherString += `Temperature: ${fTemp}°F (${cTemp}°C)\n`;
    let cHigh = Math.round(jsonData.main.temp_max - 273.15);
    let fHigh = Math.round(cHigh * 9/5 + 32);
    weatherString += `Daily high: ${fHigh}°F (${cHigh}°C)\n`;
    let timezone = find(jsonData.coord.lat,jsonData.coord.lon);
    let sunrise = new Date(jsonData.sys.sunrise*1000).toLocaleString("en-US", {timeZone:timezone[0]});
    sunrise = sunrise.split(', ')[1].slice(0,4);
    weatherString += `Sunrise :sun_with_face: ${sunrise}\n`;
    let sunset = new Date(jsonData.sys.sunset*1000).toLocaleString("en-US",{timeZone:timezone[0]});
    sunset = sunset.split(', ')[1].slice(0,4);
    weatherString += `Sunset :new_moon_with_face: ${sunset}\n`




    embed.addField(`Current weather for: ${jsonData.name}`,weatherString);
    
    



    message.channel.send({embeds:[embed]});
}