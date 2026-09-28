//Call: Slash command join
//Joins the voice channel and plays mirror intro theme!
import {
	CacheType,
	ChatInputCommandInteraction,
	GuildMember,
	MessageFlags,
} from 'discord.js';
import path from 'path';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { VoiceJoinError, queueBusy, stageNotice } from '../resources/CustomPlayer';
import { respond } from '../resources/respond';
import { answeredElsewhere } from '../resources/instanceGuard';

export class Join implements SlashCommand {
	name: string = 'join';
	description: string = 'Have Mirror join your voice channel';
	options: (Option | Subcommand)[] = [];
	//replies to a command need no permission in the channel, and joining is checked on the voice channel itself
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let channel = member.voice.channel;
			if (!channel) {
				await respond(interaction, 'You are not in a voice channel!');
				return;
			}
			//joining voice can take longer than the 3 seconds Discord waits for a reply, so acknowledge first
			await interaction.deferReply({ flags: MessageFlags.Ephemeral }); //hides the reply to anyone but the user
			const queue = bot.player.nodes.get(interaction.guild!.id);
			if (queueBusy(queue)) {
				//music is on: reconnect if voice dropped, but don't queue the greeting behind the songs
				await bot.player.joinVoice(queue!, channel);
			} else {
				//the player joins the channel and plays the greeting out of the music folder
				await bot.player.playFile(channel, path.resolve('music/mirror.mp3'));
			}
			await interaction.editReply(stageNotice(interaction.guild!) ?? 'success');
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
	blockSilenced?: boolean | undefined = true;
	musicCommand = true;
}
