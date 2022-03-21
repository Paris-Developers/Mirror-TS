import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Skip implements SlashCommand {
	name: string = 'skip';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Skip the current song in the queue',
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
			await queue.skip();
			embed.setDescription(`Track skipped by ${interaction.user}`);
			return void interaction.reply('Track might have been skipped');
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
