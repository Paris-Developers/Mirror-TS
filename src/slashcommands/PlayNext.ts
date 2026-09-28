import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	GuildMember,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { colorCheck } from '../resources/embedColorCheck';
import { MusicMetadata } from '../resources/nowPlaying';
import { VoiceJoinError, stageNotice } from '../resources/CustomPlayer';
import { respond } from '../resources/respond';
import { answeredElsewhere } from '../resources/instanceGuard';

export class PlayNext implements SlashCommand {
	name: string = 'playnext';
	description: string = 'Add a song to the begining of the queue';
	options: (Option | Subcommand)[] = [
		new Option('query', 'The song to play next', 3, true),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id,true));

			let member = interaction.member as GuildMember;

			await interaction.deferReply();
			const guild = interaction.guild!;
			const query = interaction.options.getString('query')!;
			let searchFailed = false;
			const searchResult = await bot.player
				.searchFromUser(query, interaction.user)
				.catch((error) => {
					bot.logger.warn(`[${guild.name}] Search for "${query}" failed:`, error);
					searchFailed = true;
					return null;
				});
			if (!searchResult || !searchResult.tracks.length)
				return void (await respond(
					interaction,
					searchFailed ? "Couldn't search for that right now, try again in a moment" : 'no results were found'
				));

			let queue = bot.player.nodes.create(guild, bot.player.playOptions);
			try {
				queue = await bot.player.joinVoice(queue, member.voice.channel);
			} catch (error) {
				if (!(error instanceof VoiceJoinError)) throw error;
				return void (await respond(interaction, error.message));
			}
			//the now playing card goes in the channel music was last queued from
			if (interaction.channel?.isSendable()) queue.metadata = { channel: interaction.channel } satisfies MusicMetadata;

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
					text: `Requested by ${searchResult.tracks[0].requestedBy?.tag}`,
					iconURL: searchResult.tracks[0].requestedBy?.avatarURL() ?? undefined,
				});
			await interaction.editReply({ embeds: [embed] });

			let track = searchResult.tracks[0];
			//a playlist goes to the front in its own order. a plain search returns every match it
			//found, and only the first of those is wanted
			const toInsert = searchResult.playlist ? searchResult.tracks : [track];
			//one command at a time changes the queue and decides whether to start it (see /play)
			const entry = queue.tasksQueue.acquire({ signal: AbortSignal.timeout(2 * 60 * 1000) });
			try {
				await entry.getTask();
			} catch {
				//the wait was called off: the music was reset, or the song ahead is still loading
				return void (await respond(
					interaction,
					queue.deleted
						? 'The music was reset before your song could be added. Try again.'
						: 'Mirror is still starting another song. Try again in a moment.'
				));
			}
			let starting = false;
			try {
				//someone may have taken Mirror to another channel while this command waited its turn
				if (queue.channel && queue.channel.id !== member.voice.channelId)
					return void (await respond(
						interaction,
						`Mirror was just taken to <#${queue.channel.id}>. Join it there to add songs.`
					));
				toInsert.forEach((song, index) => queue.insertTrack(song, index));
				//between two songs nothing is playing, but the next one is already on its way, and a
				//song that failed to load hands over to the next in the background
				starting = !queue.isPlaying() && !queue.currentTrack && !bot.player.isStarting(queue);
				if (starting) await bot.player.startPlaying(queue);
			} finally {
				queue.tasksQueue.release();
			}
			if (starting) {
				embed.setDescription(
					`Playing next: **${track.title}**, by *${track.author}* (${track.duration})`
				);
			} else {
				searchResult.playlist
					? embed.setDescription('Playlist added to the **front** of the queue!')
					: embed.setDescription(
							`**${track.title}**, by *${track.author}* (${track.duration}) added to the **front** of the queue!`
					  );
			}
			const notice = stageNotice(guild);
			await interaction.editReply({ content: notice ?? '', embeds: [embed] });
		} catch (err) {
			//another copy of Mirror answered this command first; it's logged, and there's no one to reply to
			if (answeredElsewhere(bot, err)) return;
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, { content: 'Error: contact a developer to investigate', embeds: [] });
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
	musicCommand?: boolean | undefined = true;
}
