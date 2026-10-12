import {
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Invite implements SlashCommand {
	name: string = 'invite';
	description: string = 'Invite link for mirror';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new EmbedBuilder()
				.setDescription(
					'Want to invite Mirror to your own server? Click [here](https://discord.com/api/oauth2/authorize?client_id=887766414923022377&permissions=139606649936&scope=bot%20applications.commands).'
				)
				.setThumbnail('https://imgur.com/nXf9JGG.jpg')
				.setFooter({
					//Discord dropped the #0001 style of name in 2023
					text: 'Created in 2021 by Ford and Phantasm',
				});
			interaction.reply({ embeds: [embed] });
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
}
