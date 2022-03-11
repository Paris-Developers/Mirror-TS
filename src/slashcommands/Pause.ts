import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Pause implements SlashCommand {
	name: string = 'pause';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Pause the music player',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		const embed = new MessageEmbed().setColor('BLUE');
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing) {
			embed.setDescription('There is no music playing!');
			return interaction.reply({ embeds: [embed], ephemeral: true });
		}
		queue.setPaused(true);
		embed.setDescription(`Music was paused by ${interaction.user}`);
		return interaction.reply({ embeds: [embed] });
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
