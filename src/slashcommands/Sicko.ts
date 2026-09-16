//Call: Slash command join
//Joins the voice channel and plays mirror intro theme?

import {
	ChatInputCommandInteraction,
	CacheType,
	GuildMember,
	MessageFlags,
	PermissionFlagsBits,
} from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Sicko implements SlashCommand {
	name: string = 'sicko';
	description: string = 'Have Mirror join your voice channel, but sicko mode';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let state = member.voice;
			if (!state.channel) {
				interaction.reply('you are not in a valid voice channel!');
				return;
			}
			//an idle queue is fine, but don't talk over music that is actually playing
			if (bot.player.nodes.get(interaction.guild!.id)?.isPlaying()) {
				interaction.reply('Cant go sicko while music is playing :sob:');
				return;
			}
			await bot.player.playFile(state.channel, path.resolve('music/sicko.mp3'));
			interaction.reply('reply lol');
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
}
