//Referenced from Sicko.ts
//Call it when you're leaving to go eat food

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

export class Munch implements SlashCommand {
	name: string = 'munch';
	description: string = 'Time to go munch some grub. But I will return.';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages, PermissionFlagsBits.DeafenMembers];
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
				interaction.reply('Cant go munch while music is playing :sob:');
				return;
			}
			await bot.player.playFile(
				state.channel,
				path.resolve('music/minecraft-eating-sound.mp3')
			);
			if(state.deaf){
				interaction.reply(`<@${interaction.user.id}>` + 'had a nice lunch.');
				state.setDeaf(false, "no longer eating")
				return;
			}
			else{
				interaction.reply(`<@${interaction.user.id}>` + 'has gone to munch a lunch.');
				state.setDeaf(true, "eating")
			return;
			}

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
