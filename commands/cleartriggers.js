
exports.run = (client, message, args) => {
    if (!message.author.id == client.config.owner) return;
    client.triggers.clear(); //clear the whole enmap
    for(let job of client.cronJobs) { //stop all the jobs
        job.stop();
    }
}