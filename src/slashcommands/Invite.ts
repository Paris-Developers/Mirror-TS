import {
	CacheType,
	ChatInputApplicationCommandData,
	CommandInteraction,
	EmbedBuilder,
	Permissions,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Invite implements SlashCommand {
	name: string = 'invite';
	description: string = 'Invite link for mirror';
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
			const embed = new EmbedBuilder()
				.setDescription(
					'Want to invite Mirror to your own server? Click [here](https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=139606649936&scope=bot%20applications.commands).'
				)
				.setThumbnail('https://imgur.com/nXf9JGG.jpg')
				.setFooter({
					text: 'Created in 2021, by Fordle#0001 and Phantasm#0001',
				});
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
