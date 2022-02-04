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
    if(fs.existsSync(`./data/intros/${interaction.guild.id}/${badUser.id}.mp4`)){
       fs.unlinkSync(`./data/intros/${interaction.guild.id}/${badUser.id}.mp4`);
       interaction.reply({content: 'Intro successfully deleted', ephemeral: true});
       return;
   }
   interaction.reply({content: `${badUser} does not have an intro.`, ephemeral:true});
   return;
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