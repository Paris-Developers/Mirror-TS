# Command Structure

Command files need three things to be imported.

- A .js file located in /commands
- A commandName variable exported
- A run function exported

If you want the command to be registered as a slash command, you also need to include an exported function registerData.

The basic structure for a slash command is as follows --

```javascript
const { Permissions } = require("discord.js");

exports.commandName = "example";

exports.requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES];

exports.registerData = (client) => {
  return {
    name: this.commandName,
    description: "Example command!",
  };
};

exports.run = async (client, interaction) => {
  interaction.reply("Hello world!");
};
```

exports.commandName must be a valid string, usually matching the name of the .js file. Do not create commands with duplicate commandNames.  
exports.requiredPermissions is an optional array of Permissions flags from the discord.js api. These permissions will be checked before the command runs, to make sure it has all the permissions it needs.  
exports.registerData must return a valid slash command object as documented [here](https://discord.js.org/#/docs/discord.js/stable/typedef/ApplicationCommandData).  
exports.run will be passed a [client](https://discord.js.org/#/docs/discord.js/stable/class/Client) object and an [interaction](https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction) object when it is called as a slash command.  
exports.run will be passed a [client](https://discord.js.org/#/docs/discord.js/stable/class/Client) object, a [message](https://discord.js.org/#/docs/discord.js/stable/class/Message) object, and argument array when called as a traditional command.

The argument array will be anything the user types after the command name, space delimited. E.g. "$example test hello world!" would return an array like this --

```javascript
["test", "hello", "world!"];
```

Traditional commands will not be registered as slash commands, and have a slightly different structure to slash commands --

```javascript
exports.commandName = "example";

exports.run = async (client, message, args) => {
  message.reply("Hello world!");
};
```

We greatly prefer new commands to be slash commands, although there are a few reasons to make a traditional command.  
If a new command you PR doesn't have a valid reason to be a traditional command, your PR will be closed. Make it a slash command.
