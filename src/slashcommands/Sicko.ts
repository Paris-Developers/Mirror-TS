//Call: Slash command join
//Joins the voice channel and plays mirror intro theme?

import {
	createAudioPlayer,
	createAudioResource,
	DiscordGatewayAdapterCreator,
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
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Sicko implements SlashCommand {
	name: string = 'sicko';
	description: string = 'Have Mirror join your voice channel, but sicko mode';
	options: (Option | Subcommand)[] = [];
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
			let queue = bot.player.getQueue(interaction.guild!.id);
			if (queue) {
				interaction.reply('Cant go sicko while music is playing :sob:');
				return;
			}
			const connection = joinVoiceChannel({
				channelId: state.channelId!,
				guildId: interaction.guildId!,
				adapterCreator: interaction.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
			});
			let audio = createAudioPlayer();
			connection.subscribe(audio);
			const mirrormp3 = createAudioResource('./music/sicko.mp3');
			audio.play(mirrormp3);
			interaction.reply('reply lol');
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean = true;
}
