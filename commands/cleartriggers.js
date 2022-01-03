
exports.commandName = 'cleartrigger';

exports.run = (client, message, args) => {
    if (!message.author.id == client.config.owner) return;
    for(let job of client.cronJobs) { //stop all the jobs
        job.stop();
    }
    client.triggers.clear(); //clear the whole enmap
    message.channel.send('Cleared all triggers globally');
}
