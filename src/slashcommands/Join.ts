//Call: Slash command join
//Joins the voice channel and plays mirror intro theme!
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
} from '@discordjs/voice';
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	GuildMember,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Join implements SlashCommand {
	name: string = 'join';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Have Mirror join your voice channel',
	};
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		let member = interaction.member as GuildMember;
		let state = member.voice;
		if (!state.channel) {
			interaction.reply('you are not in a valid voice channel!');
			return;
		}
		const connection = joinVoiceChannel({
			channelId: state.channelId!,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild!.voiceAdapterCreator,
		});
		let player = createAudioPlayer();
		connection.subscribe(player);
		const mirrormp3 = createAudioResource('./resources/music/mirror.mp3');
		player.play(mirrormp3);
		interaction.reply({ content: 'success', ephemeral: true }); //hides the reply to anyone but the user
		return;
	}
}
