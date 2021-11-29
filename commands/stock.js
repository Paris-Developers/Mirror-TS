const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.run = async (client, message, args) => {
    console.log('inside Stock fxn');
    
    //Pulls ticker data from the API and stores it as a JSON object
    let res = await fetch(`https://cloud.iexapis.com/stable/stock/${args[0]}/quote?token=${client.config.stock_token}`);
    let jsonData = await res.json();
    
    //define company name and ticker symbol
    let ticker = args[0]; 
    let company = jsonData.companyName;

    //define Total average volume
    let avgTotalVol = jsonData.avgTotalVolume;

    //define daily change and daily change percentage
    let change = jsonData.change;
    let changePercent = jsonData.changePercent;

    //creates discord message embed and edits the modifiers with the attained variables above
    const embed = new MessageEmbed()
    .setColor('#FFFFFF')
    .setTitle(`Summary for ${company}`)
    .addFields(
        {name: `Ticker:`, Value: `${ticker}`,inline: true},
        {name: `Volume:`, Value: `${avgTotalVol}`, inline: true},
        {name: `Daily Change`, value: `${changePercent}`, inline: true}
    )
    .setTimestamp()

    //sends created embed back to the channel the command was called in
    message.channel.send({embeds:[embed]});
    


    
}


