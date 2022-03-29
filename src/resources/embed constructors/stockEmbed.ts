import { MessageEmbed } from "discord.js";
import { Bot } from "../../Bot";
import config from "../../../config.json";

export async function stockEmbed(bot: Bot, query: string[]): Promise<MessageEmbed[]>{
    try{
        //splits the entry text into separate arguement
        if (query.length > 10) {
            const embed = new MessageEmbed()
                .setColor('#FFFFFF')
                .setDescription('Please provide 10 or fewer stocks to call');
            return [embed];
        }
        //trys the code as normal but if it encounters an error it will run the code under the catch function
        const embedList = [];
        let ctr = 0;
        for (let ticker of query) {
            //Pulls ticker data from the API and stores it as a JSON object
            let res = await fetch(
                `https://cloud.iexapis.com/stable/stock/${ticker}/quote?token=${config.stock_token}`
            );
            let jsonData = await res.json();

            //define company name and ticker symbol
            ticker = ticker.toUpperCase();
            let company = jsonData.companyName;

            //defines latest price, change, and sets the sign to the matching emoji.
            let curPrice = jsonData.latestPrice;
            let change = jsonData.change;
            let changePercent = jsonData.changePercent; //TODO? not using this?
            let sign = [':arrow_down_small:', ''];
            if (change > 0) {
                sign = [':arrow_up_small:', '+'];
            } else if (change == 0) {
                sign = [':left_right_arrow:', ''];
            }

            //defines previous day close
            let yesterday = jsonData.previousClose;

            //defines daily high and low prices
            let high24 = `$${jsonData.high}`;
            let low24 = `$${jsonData.low}`;
            if (high24 == `$${null}`) {
                //sets values to 'N/A' in the case of the API not updating for the day
                high24 = 'N/A';
                low24 = 'N/A';
            }

            //defines 52 week high and low trading prices
            let high52 = jsonData.week52High;
            let low52 = jsonData.week52Low;

            //creates discord message embed and edits the modifiers with the attained variables above
            embedList[ctr] = new MessageEmbed()
                .setColor('#FFFFFF')
                .setTitle(`__Summary for ${company}:__`)
                .setDescription(' ')
                .addFields(
                    {
                        name: ticker,
                        value: `${sign[0]} $${curPrice}(${sign[1]}${change})\n**Previous Close:** $${yesterday}`,
                    },
                    {
                        name: `:bar_chart: Daily Range:    `,
                        value: `:chart_with_upwards_trend: ${high24}\n:chart_with_downwards_trend: ${low24}`,
                        inline: true,
                    },
                    {
                        name: `:bar_chart: 52 Week Range:    `,
                        value: `:chart_with_upwards_trend: $${high52}\n:chart_with_downwards_trend: $${low52}`,
                        inline: true,
                    },
                    {
                        name: `:notepad_spiral: Info:`,
                        value: `Currency: ${jsonData.currency}\nPrimary Exchange: ${jsonData.primaryExchange}`,
                        inline: true,
                    }
                )
                .setTimestamp();
            ctr += 1;
        }
        //sends embed array to the channel
        return embedList;
        
    } catch(err){
        bot.logger.error(undefined, "stockEmbed", err);
        const embed = new MessageEmbed()
            .setDescription("Error, contact a developer to investigate");
        return [embed]
    }
}