import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { player, playOptions } from '../index';
import { QueryType } from 'discord-player';
import { Option, Subcommand } from './Option';

export class Play implements SlashCommand {
	name: string = 'play';
	description = 'Play a song in the voice channel.';
	options: (Option | Subcommand)[] = [
		new Option(
			'query',
			'The song or playlist you want to queue',
			ApplicationCommandOptionTypes.STRING,
			true
		),
	];
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: this.description,
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
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if mirror is not connected to voice
			if (!interaction.guild!.me?.voice) {
				embed.setDescription(
					'Mirror is not connected to a voice channel, use `/join`'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			//if the user is not connected to the correct voice, end
			if (interaction.guild!.me?.voice.channel!.id != state.channel!.id) {
				embed.setDescription(
					'Mirror is not in your voice channel! To use voice commands join the channel mirror is sitting in, or use `join` to move it to your call'
				);
				return interaction.reply({ embeds: [embed], ephemeral: true });
			}

			await interaction.deferReply();
			const guild = bot.client.guilds.cache.get(interaction.guild!.id);
			const query = interaction.options.getString('query')!;
			const searchResult = await player
				.search(query, {
					requestedBy: interaction.user,
					searchEngine: QueryType.AUTO,
				})
				.catch(() => {});
			if (!searchResult || !searchResult.tracks.length)
				return void interaction.editReply('no results were found');

			const queue = await player.createQueue(guild!, playOptions);

			await guild?.members.fetch(interaction.user.id);
			try {
				if (!queue.connection) await queue.connect(member?.voice.channel!);
			} catch {
				void player.deleteQueue(guild!.id);
				return void interaction.editReply('Could not join your voice channel');
			}

			if (searchResult.playlist) {
				embed
					.setTitle(
						`Queuing playlist: ${searchResult.playlist.title} by ${searchResult.playlist.author.name}`
					)
					.setThumbnail(searchResult.playlist.thumbnail)
					.setURL(searchResult.playlist.url);
			}
			embed
				.setDescription(
					`Loading Song: **${searchResult.tracks[0].title}** by, *${searchResult.tracks[0].author}*`
				)
				.setFooter({
					text: `Requested by ${searchResult.tracks[0].requestedBy.tag}`,
					iconURL: searchResult.tracks[0].requestedBy.avatarURL()!,
				});
			await interaction.editReply({ embeds: [embed] });

			searchResult.playlist
				? queue.addTracks(searchResult.tracks)
				: queue.addTrack(searchResult.tracks[0]);
			let track = searchResult.tracks[0];
			if (!queue.playing) {
				embed.setDescription(
					`Playing first: **${track.title}**, by *${track.author}* (${track.duration})`
				);
				await queue.play();
			} else {
				searchResult.playlist
					? embed.setDescription('Playlist added to the queue!')
					: embed.setDescription(
							`**${track.title}**, by *${track.author}* (${track.duration}) added to the queue!`
					  );
			}
			interaction.editReply({ embeds: [embed] });
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
``;
