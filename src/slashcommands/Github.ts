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
		description: 'information about our github and user privacy',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setColor('#FFFFFF')
				.setTitle(':lock: __Mirror-TS Codebase and Privacy__')
				.setDescription(
					'Mirror scans all messages in a server by default, but does not store them.\n\nIf you want to prevent Mirror from scanning messages, reinvite it without the "read messages" permissions in the Oauth portal. \n\nInterested in our open source code? Visit our [github](https://github.com/paris-developers/Mirror-TS)\n\nStill have questions? Join our [support server](https://discord.gg/uvdg2R5PAU)'
				);
			interaction.reply({ embeds: [embed] });
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
}
