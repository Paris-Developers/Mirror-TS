//Call: Slash command leave
//Leaves the voice channel for the relevant guild
import {
	CacheType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Leave implements SlashCommand {
	name: string = 'leave';
	description: string = 'Have Mirror leave your voice channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.MoveMembers,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let mirrorVoice = interaction.guild!.members.me!.voice;
			if (!mirrorVoice.channel) {
				interaction.reply({
					content: 'Not in a voice channel',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			bot.player.nodes.get(interaction.guild!.id)?.delete();
			mirrorVoice.disconnect();
			interaction.reply('Left the voice channel :wave:');
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
}
