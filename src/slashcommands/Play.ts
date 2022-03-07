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

export class Play implements SlashCommand {
	name: string = 'play';
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
		let member = interaction.member as GuildMember;
		//check that a memebr is in a voice channel

		//check that a member is in the correct voice channel

		const query = interaction.options.getString('song');
		const queue = player.createQueue(interaction.guild, {
			metadata: {
				channel: interaction.channel,
			},
		});
		await queue.connect(member.voice.channel);
		await interaction.deferReply();
		const track = await player
			.search(query, {
				requestedBy: interaction.user,
			})
			.then((x: any) => x.tracks[0]);
		if (!track) {
			interaction.editReply('could not find song');
			return;
		}
		queue.play(track);
		interaction.editReply('Successfully played your song!');
	}
	guildRequired?: boolean | undefined;
}
