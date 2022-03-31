import { joinVoiceChannel } from '@discordjs/voice';
import { CommandInteraction, GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { Bot } from '../Bot';
import { managerCheck } from '../resources/managerCheck';
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
			if (!(interaction.channel instanceof TextChannel)) {
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
			let member = interaction.member as GuildMember;
			let state = member.voice.channel;
			var embed = new MessageEmbed().setColor('BLUE');

			//if user is not connected
			if (!state) {
				embed.setDescription('You are not connected to a voice channel!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if mirror is not connected to voice
			if (!interaction.guild!.me?.voice.channel) {
				const cmdCatches = ["play","playNext","join","sicko"];
				if(cmdCatches.includes(interaction.commandName)){
					joinVoiceChannel({
						channelId: state.id!,
						guildId: interaction.guildId!,
						adapterCreator: interaction.guild!.voiceAdapterCreator,
					});
				} else {
					embed.setDescription(
						'Mirror is not connected to a voice channel, use `/join`'
					);
					return interaction.reply({ embeds: [embed], ephemeral: true });
				}
			}
			//if the user is not connected to the correct voice, end
			else if (interaction.guild!.me?.voice.channel!.id != state.id) {
				embed.setDescription(
					'Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
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
