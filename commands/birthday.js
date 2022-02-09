exports.commandName = 'birthday';


exports.run = async (client, interaction) => {
    //No global permission check because different functions are doing different things
    interaction.reply('placeholder');
    return;
    if(options.getSubcommand() == 'set'){
        //TODO: Permission Check
    }
    if(options.getSubcommand() == 'channel'){
        //TODO: Permission Check
        //TODO: verify user is an admin
    }
    if(options.getSubcommand() == 'message'){
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