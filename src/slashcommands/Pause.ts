import {
	ApplicationCommandDataResolvable,
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	GuildMember,
	MessageFlags,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { SlashCommand } from './SlashCommand';


export class Pause implements SlashCommand {
	name: string = 'pause';
	description: string = 'Pause the music player';
	options = [];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let queue = bot.player.nodes.get(interaction.guild!.id);
			if (!queue || !queue.isPlaying()) {
				embed.setDescription('There is no music playing!');
				return void interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
			}
			queue.node.setPaused(true);
			embed.setDescription(`Music was paused by ${interaction.user}`);
			return void interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
