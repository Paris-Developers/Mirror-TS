import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Github implements SlashCommand {
	name: string = 'github';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description:
			'information about contributing to Mirror and a link to our github',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setTitle('Mirror-JS Github')
				.setDescription('')
				.setURL('https://github.com/FordFriedel/Mirror-JS');
			interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.editReply({
				content: 'Error detected, contact an admin to investigate.',
			});
			return;
		}
	}
}
