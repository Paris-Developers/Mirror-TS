//Call: $stock or $s
//Returns 1-10 specified stocks
const {MessageEmbed} = require('discord.js');
const fetch = require('node-fetch');

exports.commandName = 'stock';

exports.run = async (client, interaction) => {
    //tests to see if the command was passed in with arguements
    if(!interaction.options.getString("tickers")){ 
        const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setDescription('Please provide a valid ticker(s)');
        interaction.reply({embeds:[embed]});
        return;
    }
    let args = interaction.options.getString("tickers").split(" ");
    if(args.length > 10){
        const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription('Please provide 10 or fewer stocks to call') ;
        interaction.reply({embeds:[embed]});
        return;
    }
    //trys the code as normal but if it encounters an error it will run the code under the catch function
    try {
        let replied = false;
        for (let ticker of args) {
            //Pulls ticker data from the API and stores it as a JSON object
            let res = await fetch(`https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=${client.config.stock_token}`);
            //let res2 = await fetch(`https://cloud.iexapis.com/stable/tops?token=${client.config.stock_token}&symbols=${ticker}`) <-- where is this used?
            let jsonData = await res.json();
            //let jsonData2 = await res2.json();
            //console.log(jsonData);
            //console.log(jsonData2);
                
            //define company name and ticker symbol
            ticker = ticker.toUpperCase();
            let company = jsonData.companyName;

            //defines latest price, change, and sets the sign to the matching emoji.
            let curPrice = jsonData.latestPrice;
            let change = jsonData.change;
            let changePercent = jsonData.changePercent;
            let sign = [':arrow_down_small:',''];
            if (change > 0){
                sign = [':arrow_up_small:','+'];
            } else if (change == 0){
                sign = [':left_right_arrow:',''];
            } 

            //defines previous day close
            let yesterday = jsonData.previousClose;

            //defines daily high and low prices
            let high24 = `$${jsonData.high}`;
            let low24 = `$${jsonData.low}`;
            if(high24==`$${null}`){ //sets values to 'N/A' in the case of the API not updating for the day
                high24 = 'N/A';
                low24 = 'N/A';
            }

            //defines 52 week high and low trading prices
            let high52 = jsonData.week52High;
            let low52  = jsonData.week52Low;

            //creates discord message embed and edits the modifiers with the attained variables above
            const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setTitle(`__Summary for ${company}:__`)
            .addFields(
                {name: `${ticker}`,value: `${sign[0]} $${curPrice}(${sign[1]}${change})\n**Previous Close:** $${yesterday}`},
                {name: `:bar_chart: Daily Range:    `, value: `:chart_with_upwards_trend: ${high24}\n:chart_with_downwards_trend: ${low24}`,inline: true},
                {name: `:bar_chart: 52 Week Range:    `,value: `:chart_with_upwards_trend: $${high52}\n:chart_with_downwards_trend: $${low52}`,inline: true},
                {name: `:notepad_spiral: Info:`,value: `Currency: ${jsonData.currency}\nPrimary Exchange: ${jsonData.primaryExchange}`,inline: true}
            )
            .setTimestamp()

            
            if (!replied) { // we need to reply to the interaction at least once, or it will fail
                interaction.reply({embeds: [embed]});
                replied = true;
            } else {
                interaction.followUp({embeds:[embed]});
            }
            
        }

    } catch(err) { //sends an error message if the json is invalid
        const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription('Please enter a valid ticker symbol');
        interaction.reply({embeds:[embed]});

    }    
}



exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Stock ticker data',
        options: [{
            name: 'tickers',
            type: 'STRING',
            description: 'tickers to query, space separated',
            required: true
        }],
    }
};