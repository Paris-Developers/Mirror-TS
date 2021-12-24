//Call: $news or $n
//Unfinished
//Returns top news story in the US or returns the top story(ies?) from a specified topic

const {MessageEmbed, Message} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'news';

exports.run = async (client,message,args) => {
    try{//Runs code as normal, sends  catch if an error is recieved
        const embed = new MessageEmbed() //creates embed
            .setColor('#FFFFFF')
            .setTimestamp();
        if(args.length==0){//fetches the API without query
            res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${client.config.news_token}`);
            embed.setFooter('Top news story in the US right now');
        }
        else{//when there is a query requested run the block behind
            let query = '';
            for(let arg in args){
                query += `${arg}+`;
            }
            res = await fetch(`https://newsapi.org/v2/top-headlines?country-us&q=${query}&apiKey=${client.config.news_token}`);
        }
        //sets data structure for the API pull
        let jsonData = await res.json();
        
        //specify embed modifications for individual option and sends message
        embed.setTitle(`${jsonData.articles[0].title}`);
        embed.setURL(`${jsonData.articles[0].url}`);
        embed.setDescription(`${jsonData.articles[0].description}`);
        embed.setThumbnail(`${jsonData.articles[0].urlToImage}`);
        message.channel.send({embeds:[embed]});
    }
    catch(err){//catches error 
        //add documentation and finish error testong for api related errors
        const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription('Error: Try calling the function again');  
    }
}
  