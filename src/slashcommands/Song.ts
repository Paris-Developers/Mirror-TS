//Call: $song
//Unfinished
//Implement try{}catch{}finish{} for error handling
import {
	MessageEmbed,
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Song implements SlashCommand {
	name: string = 'song';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Get your song recommendation',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed();
			bot.logger.debug('Test1');
			let mes = bot.songRecs.get(interaction.user.id);
			let member = interaction.member as GuildMember;
			embed.setTitle(`${member.displayName}'s Song Recommendation`);
			embed.setDescription(mes);
			interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.editReply({
				content: 'Error detected, contact an admin to investigate.',
			});
			return;
		}
	}
}
