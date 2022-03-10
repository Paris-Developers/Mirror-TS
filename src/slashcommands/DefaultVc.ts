import { createAudioPlayer, joinVoiceChannel } from '@discordjs/voice';
import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	VoiceChannel,
	GuildMember,
	TextChannel,
	MessageEmbed,
	Guild,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { managerCheck } from '../resources/managerCheck';
import { SlashCommand } from './SlashCommand';

export let defaultVc = new Enmap('defaultVc');

export class DefaultVc implements SlashCommand {
	name: string = 'defaultvc';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description:
			'[MANAGER] Set a default voice channel for Mirror to join upon restart, will not play a sound',
		options: [
			{
				name: 'channel',
				type: ApplicationCommandOptionTypes.CHANNEL,
				description: 'The channel you wish to designate as the default',
				required: true,
			},
		],
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		//check if the user is a Manager or Admin
		if (!(await managerCheck(interaction.guild!, interaction.user))) {
			return interaction.reply({
				content:
					'This command can only be used by designated managers or admininstrators',
				ephemeral: true,
			});
		}
		let channel = interaction.options.getChannel('channel');
		if (!(channel instanceof VoiceChannel)) {
			interaction.reply({
				content: 'Channel must be a voice channel',
				ephemeral: true,
			});
			return;
		}
		if (!interaction.guild?.me?.permissionsIn(channel.id).has('CONNECT')) {
			interaction.reply({
				content: 'I do not have permission to Connect to that VC',
				ephemeral: true,
			});
			return;
		}
		defaultVc.set(interaction.guild!.id, channel.id);
		let embed = new MessageEmbed()
			.setColor('#ffffff')
			.setDescription(
				`Sucessfully updated your default voice channel to ${channel}`
			);
		interaction.reply({ embeds: [embed] });
		return;
	}
	//TODO: guildRequired? = true;
}

export async function launchVoice(bot: Bot): Promise<void> {
	defaultVc.forEach((channel, guild) => {
		let guildCheck = bot.client.guilds.cache.get(guild.toString()) as Guild;
		const connection = joinVoiceChannel({
			channelId: channel,
			guildId: guildCheck.id,
			adapterCreator: guildCheck.voiceAdapterCreator,
		});
		let player = createAudioPlayer();
		connection.subscribe(player);
	});
}
