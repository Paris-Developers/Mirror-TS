module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return;

    if (!client.commands.has(interaction.commandName)) return;

    client.commands.get(interaction.commandName).run(client, interaction);

}