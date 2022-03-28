import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Skip implements SlashCommand {
	name: string = 'skip';
	description = 'Skip the current song in the queue';
	options = [];
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: this.description,
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

			let member = interaction.member as GuildMember;
			let state = member.voice.channel;

			//if user is not connected
			if (!state) {
				embed.setDescription('You are not connected to a voice channel!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if mirror is not connected to voice
			if (!interaction.guild!.me?.voice.channel) {
				embed.setDescription(
					'Mirror is not connected to a voice channel, use `/join`'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if the user is not connected to the correct voice, end
			else if (interaction.guild!.me?.voice.channel!.id != state.id) {
				embed.setDescription(
					'Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

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
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
}
