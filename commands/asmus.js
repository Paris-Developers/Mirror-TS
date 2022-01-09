//this is blatant bait to get gavin to work on mirror
const Enmap = require('enmap');
const {MessageEmbed} = require('discord.js');


exports.commandName = 'asmus';

let gav_records = new Enmap({name: 'gav_records'}); //named enmaps are persistent to the disk
// gav_records.set('bench', 605);
// gav_records.set('squat', 365);
// gav_records.set('deadlift', 445);
exports.run = async (client, message, args) => {
    //tests to see if the command was passed in with arguements
    if(args.length == 0){
        let bench = gav_records.ensure('bench',365);
        let squat = gav_records.ensure('squat',445);
        let deadlift = gav_records.ensure('deadlift',605);
        const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setDescription(`GAVIN'S CURRENT PRS:\n BENCH: ${bench} LB \n SQUAT: ${squat} LB \n DEADLIFT: ${deadlift} LB \n`);
        message.channel.send({embeds:[embed]});
        return;
    }
    if(args.length == 1){
        let toprint;
        if (args[0].toLowerCase() == 'bench'){
            toprint = gav_records.ensure('bench',365);
        }
        else if(args[0].toLowerCase() == 'squat'){
            toprint = gav_records.ensure('squat',445);
        }
        else if(args[0].toLowerCase() == 'deadlift' || args[0].toLowerCase() == 'rdl'){
            toprint = gav_records.ensure('deadlift',605);
        }
        if(!toprint){
            message.channel.send('INVALID LOOKUP');
            return;
        }
        const embed = new MessageEmbed()
            .setColor('#FFFFFF')
            .setDescription(`GAVIN'S ${args[0]} PR: ${toprint}`);
        message.channel.send({embeds:[embed]});
        return;
    }
    if(args.length == 2){

        if (args[0].toLowerCase() == 'bench'){
            gav_records.set('bench',args[1]);
        }
        else if(args[0].toLowerCase() == 'squat'){
            gav_records.set('squat',args[1]);
        }
        else if(args[0].toLowerCase() == 'deadlift' || args[0].toLowerCase() == 'rdl'){
            gav_records.set('deadlift',args[1]);
        }
        else{
            message.channel.send('INVALID LIFT');
            return;
        }
        const embed = new MessageEmbed()
        .setColor('#FFFFFF')
        .setDescription(`UPDATED GAVIN'S ${args[0]} PR TO: ${args[1]} \n GOOD JOB SOLDIER`);
        message.channel.send({embeds:[embed]});
        return;
    }
    message.channel.send('INVALID ARGUMENTS');
}