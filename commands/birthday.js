const Enmap = require('enmap');

exports.commandName = 'birthday';

const monthCode = {"january":1, "february":2, "march":3, "april":4, "may":5, "june":6, "july":7, "august":8,"september":9, "october":10, "november":11, "december":12}

let birthdayServers = new Enmap({name: 'birthdayServers'});
exports.run = async (client, interaction) => {
    //No global permission check because different functions are doing different things
    interaction.reply('placeholder');
    
    if(interaction.options.getSubcommand() == 'set'){
        //TODO: Permission Check

        //ensure that the enmap has stored the guild and brings in the JSON. If not create it and give it an empty JSON. 
        let guildJson = birthdayServers.ensure(`${interaction.guild.id}`,{}); 
        //store the users discordID
        let userString = interaction.user.id; 
        //store the date of birth in numerical form
        let birthdayString = `${interaction.options.getInteger('day')}-${monthCode[interaction.options.getString('month')]}`;
        //initialize or update the birthday JSON
        guildJson[userString] = birthdayString;
        //place the updated guild JSON in the enmap
        birthdayServers.set(`${interaction.guild.id}`,guildJson);
        return;
    }
    return;
    if(interaction.options.getSubcommand() == 'channel'){
        //TODO: Permission Check
        //TODO: verify user is an admin
    }
    if(interacion.options.getSubcommand() == 'message'){
        //TODO: Permission Check
    }
    //TODO, handle errors, this may have to be done in every sub command
}

const months = [{
    name: 'January',
    value: 'january'
},{
    name: 'February',
    value: 'february'
},{
    name: 'March',
    value: 'march'
},{
    name: 'April',
    value: 'april'
},{
    name: 'May',
    value: 'may'
},{
    name: 'June',
    value: 'june'
},{
    name: 'July',
    value: 'july'
},{
    name: 'August',
    value: 'august'
},{
    name: 'September',
    value: 'september'
},{
    name: 'October',
    value: 'october'
},{
    name: 'November',
    value: 'november'
},{
    name: 'December',
    value: 'december'
}]

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Set your birthday to recieve a Birthday message on your birthday!',
        options: [{
            name: 'set',
            description: 'Set your birthday',
            type: 1,
            required: false,
            options: [{
                name: 'month',
                description: 'Your birth month',
                type: 'STRING',
                required: true,
                choices: months
            },{
                name: 'day',
                description: 'The date of your birthday',
                type: 'INTEGER',
                required: true
            }]
        },{
            name: 'channel',
            description: 'Set the channel where the birthday messages are sent to',
            type: 'CHANNEL',
            required: false
        },{
            name: 'message',
            description: 'Edit the message used when its someones birthday',
            type: 'STRING',
            required: false
        }]
    }
}