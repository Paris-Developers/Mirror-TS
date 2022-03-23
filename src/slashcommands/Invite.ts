import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	MessageEmbed,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Invite implements SlashCommand {
	name: string = 'invite';
	description: string = 'Invite link for Mirror';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed()
				.setTitle('**__Invite Mirror__**')
				.setDescription(
					'Want to invite Mirror to your own server? Click the link above.'
				)
				.setThumbnail('https://imgur.com/nXf9JGG.jpg')
				.setURL(
					'https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=0&scope=bot%20applications.commands'
				)
				.setFooter({
					text: 'Created in 2021, by Fordle#0001 and Phantasm#0001',
				});
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
