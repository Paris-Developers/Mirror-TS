const chrono = require('chrono-node');
const { CronJob } = require('cron');

exports.run = (client,message,args,identifiedArgs) => {
    if (!identifiedArgs.t) return message.channel.send('Please specify a time with -t time');
    if (!identifiedArgs.c) return message.channel.send('Please specify a command with -c command');
    const results = chrono.parse(identifiedArgs.t); // chrono parses natural language into datetime
    let datedResult = results[0].start.date(); //get a javascript date object
    if (!client.commands.get(identifiedArgs.c)) return message.channel.send('Command not found/invalid command');
    let job = new CronJob(`${datedResult.getMinutes()} ${datedResult.getHours()} * * *`, () => { //set the cronjob for every day using specified hours/minutes
        let argsToPass = !identifiedArgs.a ? [] : identifiedArgs.a.trim().split(/ +/g);
        client.commands.get(identifiedArgs.c).run(client,message,argsToPass);
    });
    job.start();
    message.channel.send(`Trigger created. Will run at ${job.nextDate()} next.`);
}