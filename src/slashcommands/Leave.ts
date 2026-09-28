//Call: Slash command leave
//Leaves the voice channel for the relevant guild
import {
	CacheType,
	ChatInputCommandInteraction,
	GatewayOpcodes,
} from 'discord.js';
import { VoiceConnection, VoiceConnectionStatus, getVoiceConnection } from 'discord-voip';
import { leftOnPurpose } from './DefaultVc';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';

export class Leave implements SlashCommand {
	name: string = 'leave';
	description: string = 'Have Mirror leave your voice channel';
	options: (Option | Subcommand)[] = [];
	//Mirror leaves through its own voice connection, which needs no permission. only a leftover
	//with no connection behind it has to be moved out by hand
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const guild = interaction.guild!;
			const inVoice = !!guild.members.me?.voice.channelId;
			const queue = bot.player.nodes.get(guild.id);
			//a connection that lost its queue, or is stuck reconnecting, goes as well
			const leftover = getVoiceConnection(guild.id, bot.client.user!.id);
			if (!inVoice && !queue && !leftover) {
				await respond(interaction, 'Not in a voice channel');
				return;
			}
			leftOnPurpose(guild.id);
			const live = (connection?: VoiceConnection | null) =>
				!!connection && connection.state.status !== VoiceConnectionStatus.Destroyed;
			const connected = live(queue?.connection) || live(leftover);
			queue?.delete();
			if (live(leftover)) leftover!.destroy();
			//still shown in a channel with no connection behind it: tell Discord directly that Mirror
			//left, the way a connection would, which needs no permission
			if (inVoice && !connected)
				guild.shard.send({
					op: GatewayOpcodes.VoiceStateUpdate,
					d: { guild_id: guild.id, channel_id: null, self_mute: false, self_deaf: false },
				});
			await respond(interaction, 'Left the voice channel :wave:', false);
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean = true;
	blockSilenced?: boolean | undefined = true;
}
