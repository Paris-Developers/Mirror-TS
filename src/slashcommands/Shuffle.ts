import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { player } from '../index';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Shuffle implements SlashCommand {
	name: string = 'shuffle';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Shuffle the music queue',
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
		await queue.shuffle();
		embed.setDescription(`Queue has been shuffled by ${interaction.user}`);
		return interaction.reply('queue might have been shuffled');
	}
	guildRequired?: boolean | undefined = true;
}
