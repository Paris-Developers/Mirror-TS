//Call: Slash command leave
//Leaves the voice channel for the relevant guild
import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Leave implements SlashCommand {
	name: string = 'leave';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Have Mirror leave your voice channel.',
	};
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
