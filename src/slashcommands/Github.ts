import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	EmbedBuilder,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Github implements SlashCommand {
	name: string = 'github';
	description: string = 'information about our github and user privacy';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new EmbedBuilder()
				.setColor('#FFFFFF')
				.setTitle(':lock: __Mirror-TS Codebase and Privacy__')
				.setDescription(
					'Mirror reads all sent messages in a server by default, but does not store them.\n\nIf you want to prevent Mirror from scanning messages, reinvite it without the "read messages" permissions in the [Oauth portal](https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=139606649936&scope=bot%20applications.commands). \n\nInterested in our open source code? Visit our [github](https://github.com/paris-developers/Mirror-TS)\n\nStill have questions? Join our [support server](https://discord.gg/uvdg2R5PAU)'
				);
			interaction.reply({ embeds: [embed] });
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
}
