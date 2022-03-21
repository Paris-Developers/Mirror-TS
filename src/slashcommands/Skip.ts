import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Skip implements SlashCommand {
	name: string = 'skip';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Skip the current song in the queue',
		options: [
			{
				name: 'number',
				description: 'How many tracks you want to skip in the queue',
				type: ApplicationCommandOptionTypes.INTEGER,
				required: false,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor('BLUE');
			let queue = player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription('There is no music playing!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			let tracksToSkip = interaction.options.getInteger('number');
			if (tracksToSkip) {
				if (tracksToSkip > 15) tracksToSkip = 15;
				if (tracksToSkip > queue.tracks.length) {
					tracksToSkip = queue.tracks.length;
				}
				await queue.skipTo(tracksToSkip - 1);
				embed.setDescription(
					`${tracksToSkip} tracks skipped by ${interaction.user}`
				);
				return interaction.reply({ embeds: [embed] });
			} else {
				await queue.skip();
				embed.setDescription(`Track skipped by ${interaction.user}`);
				return interaction.reply({ embeds: [embed] });
			}
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
