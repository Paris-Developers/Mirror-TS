//Call: Slash command join
//Joins the voice channel and plays mirror intro theme!
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	VoiceConnection,
} from '@discordjs/voice';
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	GuildMember,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Join implements SlashCommand {
	name: string = 'join';
	description: string = 'Have Mirror join your voice channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			let state = member.voice;
			const connection = joinVoiceChannel({
				channelId: state.channelId!,
				guildId: interaction.guildId!,
				adapterCreator: interaction.guild!.voiceAdapterCreator,
			});
			//code copied from discord#9185
			//@ts-ignore
			connection.on("stateChange", (oldState, newState) => {
				const oldNetworking = Reflect.get(oldState, 'networking');
				const newNetworking = Reflect.get(newState, 'networking');
			  
				const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
				  const newUdp = Reflect.get(newNetworkState, 'udp');
				  clearInterval(newUdp?.keepAliveInterval);
				}
			  
				oldNetworking?.off('stateChange', networkStateChangeHandler);
				newNetworking?.on('stateChange', networkStateChangeHandler);
			});		
			let player = createAudioPlayer();
			connection.subscribe(player);
			const mirrormp3 = createAudioResource('./music/mirror.mp3');
			player.play(mirrormp3);
			interaction.reply({ content: 'success', ephemeral: true }); //hides the reply to anyone but the user
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
	blockSilenced?: boolean | undefined = true;
	musicCommand = true;
}
