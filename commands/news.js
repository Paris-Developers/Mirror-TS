const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.run = async (client,message,args) => {
    console.log('inside the News fxn');
    let query = ''; //finish
    let today = ''; //finish

    // determine if message was empty and then pulls data from the API and stores it into a JSON object
    let res = '';
    if(args.length == 0) {
        res = await fetch(`https://newsapi.org/v2/top-headlines?&from=${today}&sortBy=publishedAt&apiKey=${client.config.news_token}`);
    } else {
        res = await fetch(`https://newsapi.org/v2/top-headlines?q=${query}&from=${today}&sortBy=publishedAt&apiKey=${client.config.news_token}`);
    }
    let jsonData = await res.json();
    console.log(jsonData);
    console.log('hi');

    //figure out what we want to display in our message, do we want an embe

    //add embed

    //add messsage send

    

}
  