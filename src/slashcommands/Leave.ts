//Call: Slash command leave
//Leaves the voice channel for the relevant guild
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Leave implements SlashCommand {
	name: string = 'leave';
	description: string = 'Have Mirror leave your voice channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.MOVE_MEMBERS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			let mirrorVoice = interaction.guild!.me!.voice;
			if (!mirrorVoice.channel) {
				interaction.reply({
					content: 'Not in a voice channel',
					ephemeral: true,
				});
				return;
			}
			mirrorVoice.disconnect();
			interaction.reply('Left the voice channel :wave:');
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
	distortion = true;
}
