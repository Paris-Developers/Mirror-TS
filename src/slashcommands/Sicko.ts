//Call: Slash command join
//Joins the voice channel and plays mirror intro theme?

import {
	ChatInputCommandInteraction,
	CacheType,
	GuildMember,
} from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { VoiceJoinError, queueBusy } from '../resources/CustomPlayer';
import { respond } from '../resources/respond';
import { answeredElsewhere } from '../resources/instanceGuard';

export class Sicko implements SlashCommand {
	name: string = 'sicko';
	description: string = 'Have Mirror join your voice channel, but sicko mode';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let state = member.voice;
			if (!state.channel) {
				await respond(interaction, 'you are not in a valid voice channel!', false);
				return;
			}
			//an idle queue is fine, but don't talk over music, even between two songs
			if (queueBusy(bot.player.nodes.get(interaction.guild!.id))) {
				await respond(interaction, 'Cant go sicko while music is playing :sob:', false);
				return;
			}
			//joining voice can take longer than the 3 seconds Discord waits for a reply, so acknowledge first
			await interaction.deferReply();
			await bot.player.playFile(state.channel, path.resolve('music/sicko.mp3'));
			await interaction.editReply('reply lol');
			return;
		} catch (err) {
			//another copy of Mirror answered this command first; it's logged, and there's no one to reply to
			if (answeredElsewhere(bot, err)) return;
			if (err instanceof VoiceJoinError) return void (await respond(interaction, err.message));
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean = true;
	musicCommand?: boolean = true;
}
