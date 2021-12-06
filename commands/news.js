const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.run = async (client,message,args) => {

    console.log('inside the News fxn');
    let query = args[0]; //finish
    let today = new Date(); //finish

    // determine if message was empty and then pulls data from the API and stores it into a JSON object
    //console.log(args);

    let res = '';
    if(args.length == 0) {//sample code documentation for testing purposes
        res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${client.config.news_token}`);
    } else {
        res = await fetch(`https://newsapi.org/v2/top-headlines?q=${query}&from=${today}&sortBy=publishedAt&apiKey=${client.config.news_token}`);
    }
    let jsonData = await res.json();

    //figure out what we want to display in our message, do we want an embe

    const embed = new MessageEmbed()
        .setTitle(`${jsonData.articles[0].title}`)
        .setURL(`${jsonData.articles[0].url}`)
        .setDescription(`${jsonData.articles[0].description}`)
        .setColor('#FFFFFF')
        .setFooter('Top news story in the US right now')
        .setThumbnail(`${jsonData.articles[0].urlToImage}`)
        .setTimestamp();
    
    message.channel.send({embeds:[embed]})
    //add embed

    //add messsage send


}
  