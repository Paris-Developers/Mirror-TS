//Call: $weather or $w
//Returns weather from a single specified city
const fetch = require('node-fetch');
const {MessageEmbed,Permissions} = require('discord.js');
const { find } = require('geo-tz');

const weatherEmoji = {"Rain":":cloud_rain:","Thunderstorm":":thunder_cloud_rain:","Drizzle":":cloud_rain:","Snow":":cloud_snow:", "Clear":":sunny:", "Clouds":":cloud:", "Mist":":fog:"}
const cardinalDir = {0:"N",1:"NNE",2:"NE",3:"ENE",4:"E",5:"ESE",6:"SE",7:"SSE",8:"S",9:"SSW",10:"SW",11:"WSW",12:"W",13:"WNW",14:"NW",15:"NNW",16:"N"}

exports.commandName = 'weather';

exports.run = async (client, message, args) => {

    //check to see if Mirror has permissions to send a message in the relevant channel
    if(!(await client.permissionCheck(client,message,Permissions.FLAGS.SEND_MESSAGES))){
        console.log(`Missing permissions in channel: ${message.channel.name}`);
        return;
    }
    
    //sends an error message to the channel if no arguement is provided
    if (args.length == 0){ 
        const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription('Empty message, please provide a city');
        message.channel.send({embeds:[embed]});
    } else {  //runs the code as normally  
        //if it encounters an error it will run the code under the catch function
        try{
            //Adjusts args[] to create a cleaner output string
            let str = '';
            for(let step = 0; step<args.length;step++){
                str += args[step][0].toUpperCase() + args[step].slice(1).toLowerCase() + ' ';
            }

            //Pulls data from the API and stores as a JSON object
            let res = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${str}&appid=${client.config.weather_token}`);
            let jsonData = await res.json();

            //define current weather coniditions
            let condition = jsonData.weather[0].main;

            //define current temperatures
            let cTemp = Math.round(jsonData.main.temp - 273.15);
            let fTemp = Math.round(cTemp * 9/5 + 32);

            //define daily high temperatures
            let cHigh = Math.round(jsonData.main.temp_max - 273.15);
            let fHigh = Math.round(cHigh * 9/5 + 32);

            //define timezone and sunrise
            let timezone = find(jsonData.coord.lat,jsonData.coord.lon);
            let sunrise = new Date(jsonData.sys.sunrise*1000).toLocaleString("en-US", {timeZone:timezone[0]});
            sunrise = sunrise.split(', ')[1].slice(0,4);

            //define sunset
            let sunset = new Date(jsonData.sys.sunset*1000).toLocaleString("en-US",{timeZone:timezone[0]});
            sunset = sunset.split(', ')[1].slice(0,4);

            //define humidity and wind ## NOTE WIND COMES IN AT M/S
            let humidity = `${jsonData.main.humidity} %`;
            let kmhWind = Math.round(jsonData.wind.speed * 3.6);
            let mphWind = Math.round(kmhWind * .621371);
            let windDir = ''; //declare before the ifelse so that the variable values can be hoisted to the main fxn
            if(mphWind == 0){ //sets wind direction to a placeholder string if there is no wind
                windDir = '';
            } else {
                windDir = cardinalDir[Math.round(jsonData.wind.deg / 22.8)];
            }

            //creates message embed and edits modifiers
            const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setTitle(`**Current Weather in ${str}**`)
            .addFields( //adds multiple embed fields simultaneously 
                {name: `Temp: ${fTemp}°F (${cTemp}°C) \nHigh: ${fHigh}°F (${cHigh}°C)`,value: `${condition} ${weatherEmoji[condition]}`,inline: false},
                {name: 'Wind:', value: `${mphWind} mph (${kmhWind} kmh) \n${windDir}`,inline: true},
                {name: 'Daylight:', value: `:sun_with_face: ${sunrise}\n:new_moon_with_face: ${sunset}`,inline: true},
                {name: 'Humidity:', value: `${humidity}`,inline: true},
            )
            .setTimestamp();
                
            //sends embed to the channel
            message.channel.send({embeds:[embed]});
        }  catch(err){ //error message, invalid city
            const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setDescription('Could not find the specified city');
            message.channel.send({embeds:[embed]});
        }
    }    
}