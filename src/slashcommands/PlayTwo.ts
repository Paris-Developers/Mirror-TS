import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	GuildMember,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { player } from '../index';
import { QueryType, Track } from 'discord-player';

export class PlayTwo implements SlashCommand {
	name: string = 'playtwo';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'Play a song in the voice channel.',
		options: [
			{
				name: 'song',
				description: 'the song you want to queue',
				type: ApplicationCommandOptionTypes.STRING,
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		interaction.deferReply();
		const guild = bot.client.guilds.cache.get(interaction.guild!.id);
		const channel = guild?.channels.cache.get(interaction.channelId);
		const query = interaction.options.getString('song')!;
		const searchResult = await player
			.search(query, {
				requestedBy: interaction.user,
				searchEngine: QueryType.AUTO,
			})
			.catch(() => {
				console.log('he');
			});
		if (!searchResult || !searchResult.tracks.length)
			return void interaction.editReply('no results were found');

		const queue = await player.createQueue(guild!, {});
		const member =
			guild?.members.cache.get(interaction.user.id) ??
			(await guild?.members.fetch(interaction.user.id));
		try {
			if (!queue.connection) await queue.connect(member?.voice.channel!);
		} catch {
			void player.deleteQueue(guild!.id);
			return void interaction.editReply('Could not join your voice channel');
		}
		await interaction.editReply({
			content: `⏱ | Loading your ${
				searchResult.playlist ? 'playlist' : 'track'
			}...`,
		});
		searchResult.playlist
			? queue.addTracks(searchResult.tracks)
			: queue.addTrack(searchResult.tracks[0]);
		if (!queue.playing) await queue.play();
	}
	guildRequired?: boolean | undefined;
}
