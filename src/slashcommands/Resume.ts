import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Resume implements SlashCommand {
	name: string = 'resume';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Pause the music player',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor('BLUE');

			let member = interaction.member as GuildMember;
			let state = member.voice;

			//if user is not connected
			if (!state) {
				embed.setDescription('You are not connected to a voice channel!');
				return interaction.reply({embeds: [embed], ephemeral:true})
			}

			//if mirror is not connected to voice
			if (!interaction.guild!.me?.voice) {
				embed.setDescription('Mirror is not connected to a voice channel, use `/join`');
				return interaction.reply({embeds: [embed], ephemeral:true})
			}

			//if the user is not connected to the correct voice, end
			if (interaction.guild!.me?.voice.channel!.id != state.channel!.id) {
				embed.setDescription('Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call');
				return interaction.reply({embeds: [embed], ephemeral:true})
			}
			
			let queue = player.getQueue(interaction.guild!.id);
			if (!queue || !queue.playing) {
				embed.setDescription('There is no music playing!');
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}
			queue.setPaused(false);
			embed.setDescription(`Track was resumed by ${interaction.user}`);
			return interaction.reply({ embeds: [embed] });
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
	blockSilenced?: boolean | undefined = true;
}
