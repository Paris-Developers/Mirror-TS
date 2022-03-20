//Call: Slash command join
//Joins the voice channel and plays mirror intro theme?

import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} from '@discordjs/voice';
import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	GuildMember,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Sicko implements SlashCommand {
	name: string = 'sicko';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Have Mirror join your voice channel/but sicko mode',
	};
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let state = member.voice;
			if (!state.channel) {
				interaction.reply('you are not in a valid voice channel!');
				return;
			}
			const connection = joinVoiceChannel({
				channelId: state.channelId!,
				guildId: interaction.guildId!,
				adapterCreator: interaction.guild!.voiceAdapterCreator,
			});
			let player = createAudioPlayer();
			connection.subscribe(player);
			const mirrormp3 = createAudioResource('./music/sicko.mp3');
			player.play(mirrormp3);
			interaction.reply('reply lol');
			return;
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean = true;
}
