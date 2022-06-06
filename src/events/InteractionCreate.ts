import { joinVoiceChannel } from '@discordjs/voice';
import { CommandInteraction, GuildMember, MessageEmbed, TextChannel, TextBasedChannel, GuildChannel } from 'discord.js';
import { Bot } from '../Bot';
import { managerCheck } from '../resources/managerCheck';
import { voiceCommandCheck } from '../resources/voiceCommandCheck';
import { silenceCheck } from '../slashcommands/SilenceRole';
import { EventHandler } from './EventHandler';

export class InteractionCreate implements EventHandler {
	eventName = 'interactionCreate';

	async process(bot: Bot, interaction: CommandInteraction) {
		if (!interaction.isCommand()) return;

		//attempt to find the command from the array of all of them
		let command = bot.slashCommands.find(
			(command) => command.name === interaction.commandName
		);

		//we didn't find it, exit
		if (!command) return;

		//if the command needs to be run in a server setting
		if (command.guildRequired) {
			//If the command is used in anything but a server, return
			if (!(interaction.channel instanceof GuildChannel)) {
				interaction.reply('Command must be used in a server');
				return;
			}
		}
		if (command.managerRequired) {
			if (!(await managerCheck(interaction))) {
				return interaction.reply({
					content:
						'This command can only be used by designated managers or admininstrators',
					ephemeral: true,
				});
			}
		}
		if(command.blockSilenced) {
			if(await silenceCheck(interaction)){				
				return interaction.reply({
					content:
						'This command cannot be used by silenced members',
					ephemeral: true,
				});
			}
		}
		if(command.musicCommand){
			if(!(await voiceCommandCheck(bot, interaction))) return;
		}
		//if the command requires permissions
		if (command.requiredPermissions) {
			if (
				!(await bot.permissionsCheck(
					bot,
					interaction,
					command.requiredPermissions
				))
			) {
				// We don't have all the permissions we need. Log and return.
				if (!(interaction.channel instanceof TextChannel)) {
					bot.logger.error(
						undefined,
						undefined,
						`Somehow permissionsCheck returned false in a non-textchannel. Offending command: ${command.name}`
					);
				} else {
					bot.logger.warn(
						`Missing permissions to use ${command.name} in channel: ${
							interaction.channel!.name
						}, in ${interaction.guild!.name}`
					);
				}
				return;
			}
		}
		command.run(bot, interaction);
	}
}
