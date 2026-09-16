//Call: Slash command join
//Joins the voice channel and plays mirror intro theme!
import {
	CacheType,
	ChatInputCommandInteraction,
	GuildMember,
	MessageFlags,
	PermissionFlagsBits,
} from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Join implements SlashCommand {
	name: string = 'join';
	description: string = 'Have Mirror join your voice channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let channel = member.voice.channel;
			if (!channel) {
				interaction.reply({
					content: 'You are not in a voice channel!',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			//the player joins the channel and plays the greeting out of the music folder
			await bot.player.playFile(channel, path.resolve('music/mirror.mp3'));
			interaction.reply({ content: 'success', flags: MessageFlags.Ephemeral }); //hides the reply to anyone but the user
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	}
	guildRequired?: boolean = true;
	blockSilenced?: boolean | undefined = true;
	musicCommand = true;
}
