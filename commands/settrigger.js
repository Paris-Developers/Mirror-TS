const chrono = require('chrono-node');
const { CronJob } = require('cron');

exports.run = (client,message,args,identifiedArgs) => {
    if (!identifiedArgs.t) return message.channel.send('Please specify a time with -t time');
    if (!identifiedArgs.c) return message.channel.send('Please specify a command with -c command');
    const commandName = identifiedArgs.c.trim().toLowerCase(); //trim it and make sure it's lowercase as all enmap keys are lowecase
    if (!client.commands.get(commandName)) return message.channel.send('Command not found/invalid command');
    const results = chrono.parse(identifiedArgs.t); // chrono parses natural language into datetime
    if (!results[0]) return message.channel.send(`Couldn't parse '${identifiedArgs.t}' into a valid time.\nTry something like: 9:35pm ET`);
    let datedResult = results[0].start.date(); //get a javascript date object (not really needed I guess? could just pull from results directly)
    //we need to split the data in 'a' to an array. If they didn't specify any args pass an empty array 
    let argsToPass = !identifiedArgs.a ? [] : identifiedArgs.a.trim().split(/ +/g); 
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
    let currentTriggers = client.triggers.ensure(message.guild.id, {triggers: []}).triggers;
    //push a new object to the array
    currentTriggers.push({
        channel: message.channel.id,
        commandName: commandName,
        args: argsToPass,
        cronTime: cronTime
    });
    //set the new array to the enmap
    client.triggers.set(message.guild.id, {triggers: currentTriggers});
    message.channel.send(`Trigger created. Will run at ${job.nextDate()} next.`);
}