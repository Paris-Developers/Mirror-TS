//penis pie makes the chicken cry
//
//

exports.commandName = 'cum';
exports.run = async (client,message,args) => {
    let rand = Math.round(100*Math.random());
    console.log(rand);
    if (rand==69){
        message.reply("You are the scrumple king");
        return;
    }
    message.channel.send("Absolutely nothing");
}