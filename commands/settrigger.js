const chrono = require('chrono-node');
const { CronJob } = require('cron');

exports.run = (client,message,args,identifiedArgs) => {
    if (!identifiedArgs.t) return message.channel.send('Please specify a time with -t time');
    if (!identifiedArgs.c) return message.channel.send('Please specify a command with -c command');
    if (!client.commands.get(identifiedArgs.c)) return message.channel.send('Command not found/invalid command');
    const results = chrono.parse(identifiedArgs.t); // chrono parses natural language into datetime
    let datedResult = results[0].start.date(); //get a javascript date object
    //set the cronjob for every day using specified hours/minutes
    let job = new CronJob(`${datedResult.getMinutes()} ${datedResult.getHours()} * * *`, () => {
        //we need to split the data in 'a' to an array. If they didn't specify any args pass an empty array 
        let argsToPass = !identifiedArgs.a ? [] : identifiedArgs.a.trim().split(/ +/g); 
        //get the command from the enmap and pass it what it needs
        client.commands.get(identifiedArgs.c).run(client,message,argsToPass);
    });
    job.start();
    //TODO save needed data to creat cronjob in a persitent enmap
    message.channel.send(`Trigger created. Will run at ${job.nextDate()} next.`);
}