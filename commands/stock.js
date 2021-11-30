const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
    console.log('inside Stock fxn');
    
    //Pulls ticker data from the API and stores it as a JSON object
    let res = await fetch(`https://cloud.iexapis.com/stable/stock/${args[0]}/quote?token=${client.config.stock_token}`);
    let jsonData = await res.json();

    console.log(jsonData);
    
    //define company name and ticker symbol
    let ticker = args[0]; 
    ticker = ticker.toUpperCase();
    let company = jsonData.companyName;

    //defines latest price, change, and sets the sign to the matching emoji.
    let curPrice = jsonData.latestPrice;
    let change = jsonData.change;
    let changePercent = jsonData.changePercent;
    let sign = ':arrow_down_small:';
    if (change > 0){
        sign = ':arrow_up_small:'
    } else if (change == 0){
        sign = ':left_righ_arrow:'
    } 

    //defines previous day close
    let yesterday = jsonData.previousClose;


    //defines 52 week high and low trading prices
    let high52 = jsonData.week52High;
    let low52  = jsonData.week52Low;

    //creates discord message embed and edits the modifiers with the attained variables above
    const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle(`Summary for ${company}`)
    /*.addFields(
        {name: `Ticker:`, value: `${ticker}`,inline: true},
        {name: `Volume:`, value: `${avgTotalVol}`, inline: true},
        {name: `Daily Change`, value: `${changePercent}`, inline: true}
    )*/
    .addFields(
        {name: `${ticker}`,value: `${sign} ${curPrice}(${change})`},
        {name: `Previous Close:    `, value: `${yesterday}`,inline: true},
        {name: `52 Week Range:    `,value: `:chart_with_upwards_trend: ${high52}\n:chart_with_downwards_trend: ${low52}`,inline: true},
        {name: `Info:`,value: `Currency: ${jsonData.currency}\nPrimary Exchange: ${jsonData.primaryExchange}`,inline: true}
    )
    .setTimestamp()

    //sends created embed back to the channel the command was called in
    message.channel.send({embeds:[embed]});
    


    
}


