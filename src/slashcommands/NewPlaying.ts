import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class NewPlaying implements SlashCommand {
	name: string = 'nowplaying';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Get the current song',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing) return interaction.reply('There is no queue');
		let track = queue.nowPlaying();
		let trackString = `Now playing | **${track.title}**, by *${track.author}* (${track.duration})`;
		const embed = new MessageEmbed().setDescription(trackString).setFooter({
			text: `Requested by ${track.requestedBy.tag}`,
			iconURL: track.requestedBy.avatarURL()!,
		});
		return interaction.reply({ embeds: [embed] });
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
