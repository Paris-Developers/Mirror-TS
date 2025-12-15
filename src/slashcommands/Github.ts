import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { colorCheck } from '../resources/embedColorCheck';

export class Github implements SlashCommand {
	name: string = 'github';
	description: string = 'information about our github and user privacy';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const response = await fetch('https://api.github.com/repos/paris-developers/Mirror-TS');
			const jsonData: any = await response.json();
			const embed = new EmbedBuilder()
				.setTitle(jsonData.name)
				.setURL(jsonData.html_url)
				.setDescription(jsonData.description)
				.setThumbnail(jsonData.owner.avatar_url)
				.addFields([
					{ name: 'Stars', value: `${jsonData.stargazers_count}`, inline: true },
					{ name: 'Forks', value: `${jsonData.forks_count}`, inline: true },
					{ name: 'Issues', value: `${jsonData.open_issues_count}`, inline: true },
					{ name: 'Language', value: `${jsonData.language}`, inline: true },
					{ name: 'Created At', value: `${new Date(jsonData.created_at).toLocaleDateString()}`, inline: true },
					{ name: 'Last Push', value: `${new Date(jsonData.pushed_at).toLocaleDateString()}`, inline: true },
				])
				.setColor(colorCheck(interaction.guild!.id))
				.setFooter({ text: `Requested by ${interaction.user.tag}` });
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
