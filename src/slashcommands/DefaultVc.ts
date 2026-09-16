import {
	ApplicationCommandDataResolvable,
	ChatInputCommandInteraction,
	CacheType,
	VoiceChannel,
	GuildMember,
	TextChannel,
	EmbedBuilder,
	Guild,
	MessageFlags,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export let defaultVc = new Enmap({ name: 'defaultVc' });

export class DefaultVc implements SlashCommand {
	name: string = 'defaultvc';
	description =
		'[MANAGER] Set voice channel for Mirror to join upon restart, will not play an intro';
	options: (Option | Subcommand)[] = [
		new Option(
			'channel',
			'The channel you wish to designate as the default',
			ApplicationCommandOptionType.Channel,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			let member = interaction.member as GuildMember;
			if (
				!(interaction.channel instanceof TextChannel) ||
				!member.permissionsIn(interaction.channel!).has(PermissionFlagsBits.Administrator)
			) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			let channel = interaction.options.getChannel('channel');
			if (!(channel instanceof VoiceChannel)) {
				interaction.reply({
					content: 'Channel must be a voice channel',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			if (!interaction.guild?.members.me?.permissionsIn(channel.id).has(PermissionFlagsBits.Connect)) {
				interaction.reply({
					content: 'I do not have permission to Connect to that VC',
					flags: MessageFlags.Ephemeral,
				});
				return;
			}
			defaultVc.set(interaction.guild!.id, channel.id);
			let embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setDescription(
					`Sucessfully updated your default voice channel to ${channel}`
				);
			interaction.reply({ embeds: [embed] });
			return;
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
	managerRequired?: boolean | undefined = true;
}

export async function launchVoice(bot: Bot): Promise<void> {
	for (const [guild, channel] of defaultVc.entries()) {
		let guildCheck = bot.client.guilds.cache.get(guild.toString()) as Guild;
		if (!guildCheck) {
			defaultVc.delete(guild);
			continue;
		}
		//an idle queue keeps Mirror sitting in the channel, ready for music or intros
		const queue = bot.player.nodes.create(guildCheck, bot.player.playOptions);
		try {
			if (!queue.connection) await queue.connect(channel);
		} catch (err) {
			bot.logger.warn(`Could not join the default voice channel in ${guildCheck.name}`);
		}
	}
}
