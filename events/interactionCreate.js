module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return;

    if (!client.commands.has(interaction.commandName)) return;

    let command = client.commands.get(interaction.commandName);

    //if the command requires permissions
    if (command.requiredPermissions) {
        if(!(await client.permissionsCheck(client,interaction,command.requiredPermissions))){
            // We don't have all the permissions we need. Log and return.
            client.logger.warn(`Missing permissions to use ${command.commandName} in channel: ${interaction.channel.name}, in ${interaction.guild.name}`);
            return;
        }
    }

    //all checks passed, run the command
    command.run(client, interaction);

}