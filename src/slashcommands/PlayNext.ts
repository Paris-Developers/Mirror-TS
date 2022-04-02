import {
	CommandInteraction,
	CacheType,
	MessageEmbed,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { QueryType } from 'discord-player';
import { SlashCommand } from './SlashCommand';
import { joinVoiceChannel } from '@discordjs/voice';
import { colorCheck } from '../resources/embedColorCheck';

export class PlayNext implements SlashCommand {
	name: string = 'playnext';
	description: string = 'Add a song to the begining of the queue';
	options: (Option | Subcommand)[] = [
		new Option('query', 'The song to play next', 3, true),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor(colorCheck(interaction.guild!.id,true));

			let member = interaction.member as GuildMember;

			await interaction.deferReply();
			const guild = bot.client.guilds.cache.get(interaction.guild!.id);
			const query = interaction.options.getString('query')!;
			const searchResult = await bot.player
				.search(query, {
					requestedBy: interaction.user,
					searchEngine: QueryType.AUTO,
				})
				.catch(() => {});
			if (!searchResult || !searchResult.tracks.length)
				return void interaction.editReply('no results were found');

			const queue = await bot.player.createQueue(guild!, bot.player.playOptions);

			await guild?.members.fetch(interaction.user.id);
			try {
				if (!queue.connection) await queue.connect(member?.voice.channel!);
			} catch {
				void bot.player.deleteQueue(guild!.id);
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
					`Playing next: **${searchResult.tracks[0].title}** by, *${searchResult.tracks[0].author}*`
				)
				.setFooter({
					text: `Requested by ${searchResult.tracks[0].requestedBy.tag}`,
					iconURL: searchResult.tracks[0].requestedBy.avatarURL()!,
				});
			await interaction.editReply({ embeds: [embed] });

			if (searchResult.playlist) {
				queue.addTracks(searchResult.tracks.slice(1, -1));
			}
			queue.insert(searchResult.tracks[0], 0);

			let track = searchResult.tracks[0];
			if (!queue.playing) {
				embed.setDescription(
					`Playing next: **${track.title}**, by *${track.author}* (${track.duration})`
				);
				await queue.play();
			} else {
				searchResult.playlist
					? embed.setDescription('Playlist added to the queue!')
					: embed.setDescription(
							`**${track.title}**, by *${track.author}* (${track.duration}) added to the **front** of the queue!`
					  );
			}
			interaction.editReply({ embeds: [embed] });
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
