import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';

export class Shuffle implements SlashCommand {
	name: string = 'shuffle';
	description: string = 'Shuffle the music queue';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription('There is no music playing!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			await queue.shuffle();
			embed.setDescription(`Queue has been shuffled by ${interaction.user}`);
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
