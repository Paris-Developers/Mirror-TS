const chrono = require('chrono-node');
const { CronJob } = require('cron');
const { Permissions } = require('discord.js');

/*
    The try catch block in CronJob will NOT be able to catch errors from asynchronous commands
    Handle your errors in their respective files or you will break everything
*/

exports.commandName = 'settrigger';

exports.run = (client,message,args,identifiedArgs) => {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;
    if (!identifiedArgs.t) return message.channel.send('Please specify a time with -t time');
    if (!identifiedArgs.c) return message.channel.send('Please specify a command with -c command');
    const commandName = identifiedArgs.c.trim().toLowerCase(); //trim it and make sure it's lowercase as all enmap keys are lowecase
    if (!client.commands.get(commandName)) return message.channel.send('Command not found/invalid command');
    const results = chrono.parse(identifiedArgs.t); // chrono parses natural language into datetime
    if (!results[0]) return message.channel.send(`Couldn't parse '${identifiedArgs.t}' into a valid time.\nTry something like: 9:35pm ET`);
    //get a javascript date object (not really needed I guess? could just pull from results directly)
    let datedResult = results[0].start.date(); 
    //we need to split the data in 'a' to an array. If they didn't specify any args pass an empty array 
    let argsToPass = !identifiedArgs.a ? [] : identifiedArgs.a.trim().split(/ +/g); //ternary operator
    //construct the cronjob time
    let cronTime = `${datedResult.getMinutes()} ${datedResult.getHours()} * * *`;
    let job = new CronJob(cronTime, () => {       
        //get the command from the enmap and pass it what it needs
        try {
            client.commands.get(commandName).run(client,message,argsToPass);
        } catch(err) {
            message.channel.send(`Error with trigger ${commandName}: ${err}`);
            job.stop();
        }
    });
    job.start();
    //get the current triggers
    let currentTriggers = client.triggers.ensure(message.guild.id, []);
    //make a new array with the same values
    let newTriggers = currentTriggers.slice();
    //push a new object to the array
    //CronJob is circular, which is really annoying to deal with, so just pass the stop and start functions
    newTriggers.push({ //array fxn push
        channel: message.channel.id,
        commandName: commandName,
        args: argsToPass,
        cronTime: cronTime,
        stopJob: job.stop,
        startJob: job.start
    });
    //set the new array to the enmap
    client.triggers.set(message.guild.id, newTriggers);
    //display updated trigger info
    client.commands.get('triggers').run(client,message,args); 
}