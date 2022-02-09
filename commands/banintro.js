//Call: Slash command banintro
//Removes a selected users intro
const fs = require('fs');

exports.commandName = 'banintro';

exports.run = async (client, interaction) => {
    //TODO add permissions check?
    if(!interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {
        interaction.reply({content:"This command is only for people with Administrator permissions", ephemeral:true}); 
        return;
    }
    let badUser = interaction.options.getUser('user');
    try{
        fs.unlink(`./data/intros/${interaction.guild.id}/${badUser.id}.mp4`, (err => {
            if(err) {
                if(err.code == 'ENOENT') {
                    interaction.reply({content: `${badUser} does not have an intro.`, ephemeral:true});
                    return;
                } else {
                    interaction.reply({content: 'Error detected, contact an admin for further details.', ephemeral: true});
                    return;
                }
            } 
            else{
                interaction.reply({content: 'Intro successfully deleted', ephemeral: true});
                return;
            }
        }));
    } catch(err){
        console.log(err);
        interaction.reply({content: 'Error', ephemeral:true});
        return;
    }
}

exports.registerData = (client) => {
    return {
        name: this.commandName,
        description: 'Delete someones intro theme!',
        options: [{
            name: 'user',
            type: 'USER',
            description: 'Member to remove intro',
            required: true
       }]
    }
};