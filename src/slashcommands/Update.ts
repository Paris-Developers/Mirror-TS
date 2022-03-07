import { Bot } from '../Bot';
import {
	Permissions,
	CommandInteraction,
	CacheType,
	GuildMember,
	TextChannel,
	Guild,
	MessageEmbed,
} from 'discord.js';
import { SlashCommand } from './SlashCommand';
import config from '../../config.json';
import Enmap from 'enmap';

export let updateChannels = new Enmap({ name: 'updateChannels' });

export class Update implements SlashCommand {
	public name = 'update';
	public registerData = {
		name: this.name,
		description:
			'[ADMIN ONLY] Set the channel you wish to recieve Mirror update messages in',
		options: [
			{
				name: 'channel',
				description: 'The channel you wish to recieve update messages',
				type: 7,
				required: true,
			},
		],
	};
	public requiredPermissions = [Permissions.FLAGS.SEND_MESSAGES];

	public async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<void> {
		try {
			if (!(interaction.channel instanceof TextChannel)) {
				interaction.reply('Command must be used in a server');
				return;
			}
			let member = interaction.member as GuildMember;
			if (
				!member.permissionsIn(interaction.channel!).has('ADMINISTRATOR') &&
				member.id != config.owner
			) {
				interaction.reply({
					content:
						'This command is only for people with Administrator permissions',
					ephemeral: true,
				});
				return;
			}
			let channel = interaction.options.getChannel('channel');
			if (
				!interaction.guild?.me
					?.permissionsIn(channel?.id!)
					.has('SEND_MESSAGES') ||
				!interaction.guild?.me?.permissionsIn(channel?.id!).has('EMBED_LINKS')
			) {
				interaction.reply({
					content:
						'Mirror does not have permissions to send messages in the specified channel',
					ephemeral: true,
				});
				return;
			}
			if (channel!.type != 'GUILD_TEXT')
				return interaction.reply({
					content: 'Channel must be a text channel',
					ephemeral: true,
				});
			//var enmapChannel = updateChannels.ensure(interaction.guild.id, '');
			updateChannels.set(interaction.guild.id, channel?.id);
			let embed = new MessageEmbed()
				.setColor('#ffffff')
				.setDescription(
					`Sucessfully updated your development messages to ${channel}`
				);
			interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean = true;
}
