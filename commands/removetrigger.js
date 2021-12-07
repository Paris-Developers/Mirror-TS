const { Permissions } = require('discord.js');

exports.run = (client, message, args) => {
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;
    if (!args[0]) return message.channel.send(`Please specify a trigger index (use $triggers to view their numbers)`);
    let triggers = client.triggers.ensure(message.guild.id, []);
    let index = args[0]-1; // triggers.js displays with an index starting at 1, so decrement by one for our needs
    if (!triggers[index]) return message.channel.send(`Couldn't find a trigger with id ${index+1}`);
    triggers[index].stopJob(); //stop the job
    triggers.splice(index,1); //remove the trigger object from the array
    client.triggers.set(message.guild.id, triggers); //set the new triggers (without the one we just removed)
    client.commands.get("triggers").run(client,message,args); //display the new trigger information
}