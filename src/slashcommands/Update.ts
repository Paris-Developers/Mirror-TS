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
import { managerCheck } from '../resources/managerCheck';

export let updateChannels = new Enmap({ name: 'updateChannels' });

export class Update implements SlashCommand {
	public name = 'update';
	public registerData = {
		name: this.name,
		description:
			'[MANAGER] Set the channel you wish to recieve Mirror update messages in',
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
		//check if the user is a Manager or Admin
		if (!(await managerCheck(interaction.guild!, interaction.user))) {
			return interaction.reply({
				content:
					'This command can only be used by designated managers or admininstrators',
				ephemeral: true,
			});
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
	}
	guildRequired?: boolean = true;
}
