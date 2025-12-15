
import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	ChannelType,
	VoiceChannel,
	Guild,
	GuildBasedChannel,
	PermissionResolvable
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { bdayChannels } from './BirthdayConfig';
import { defaultVc } from './DefaultVc';
import { updateChannels } from './Update';
import { nsfw } from './Nsfw';
import { managerRoles } from './ManagerRole';
import { silencedRole } from './SilenceRole';
import { serverColors } from './ServerColor';
import { colorCheck } from '../resources/embedColorCheck';

const permList = [
	['ADD_REACTIONS', PermissionFlagsBits.AddReactions],
	['CONNECT', PermissionFlagsBits.Connect],
	['EMBED_LINKS', PermissionFlagsBits.EmbedLinks],
	['MANAGE_MESSAGES', PermissionFlagsBits.ManageMessages],
	['MOVE_MEMBERS', PermissionFlagsBits.MoveMembers],
	['SEND_MESSAGES', PermissionFlagsBits.SendMessages],
	['SPEAK', PermissionFlagsBits.Speak],
	['USE_EXTERNAL_EMOJIS', PermissionFlagsBits.UseExternalEmojis],
	['VIEW_CHANNEL', PermissionFlagsBits.ViewChannel]]

export class Config implements SlashCommand {
	name: string = 'config';
	description = 'See the configuration settings for this server';
	options = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			let embed = new EmbedBuilder()
				.setTitle(`: gear: Server Settings for ${interaction.guild?.name}`)
				.setColor(colorCheck(interaction.guild!.id));
			let lines: any[][] = [
				['Setting', 'Description', 'Configuration'],
				['`/ update`', 'Mirror development updates', '❌'],
				['`/ birthdayconfig`', 'Recieve birthday messages', '❌'],
				['`/ defaultvc`', 'Channel Mirror joins automatically', '❌'],
				['`/ nsfw`', 'Toggle NSFW settings', '❌'],
				['`/ servercolor`', 'Change default color', '❌'],
			];
			let bday = bdayChannels.get(interaction.guild!.id);
			let defaultVoice;
			let defaultVcArray = Array.from(defaultVc.entries());
			defaultVcArray.forEach((entry: any) => {
				let channel = entry[1];
				let guild = entry[0];
				let guildCheck = bot.client.guilds.cache.get(guild.toString()) as Guild;
				if (guildCheck.id == interaction.guild!.id) {
					defaultVoice = channel;
				}
			});
			let update = updateChannels.get(interaction.guild!.id);
			let nsfwToggle = nsfw.get(interaction.guild!.id);
			let silence = silencedRole.get(interaction.guild!.id);
			let serverColor = serverColors.get(interaction.guild!.id);
			if (update) {
				update = bot.client.channels.cache.get(update);
			}
			if (bday) {
				bday = bot.client.channels.cache.get(bday);
			}
			if (defaultVoice) {
				defaultVoice = bot.client.channels.cache.get(defaultVoice);
				lines[3][2] = defaultVoice;
			}
			if (nsfwToggle == 'on') {
				lines[4][2] = '✅';
			}
			if (serverColor) {
				lines[5][2] = serverColor;
			}
			let managerArray = managerRoles.ensure(interaction.guild!.id, []);
			let managerString = '';
			if (managerArray.length == 0) {
				managerString = 'Add Mirror Managers with `/ managerrole`';
			} else {
				for (let role of managerArray) {
					let getRole = interaction.guild?.roles.cache.get(role);
					managerString = managerString + `${getRole} ` + ', ';
				}
				managerString = managerString.slice(0, -2);
			}
			let silenceString =
				'To prevent someone interacting with introthemes, birthday commands or music\n`/ silencerole` or ` / silencemember`';
			if (silence) {
				let getRole = interaction.guild?.roles.cache.get(silence);
				silenceString = `${getRole} `;
			}
			embed.addFields(
				{
					name: lines[0][0],
					value: `${lines[1][0]} \n${lines[2][0]} \n${lines[3][0]} \n${lines[4][0]} \n${lines[5][0]} `,
					inline: true,
				},
				{
					name: lines[0][1],
					value: `${lines[1][1]} \n${lines[2][1]} \n${lines[3][1]} \n${lines[4][1]} \n${lines[5][1]} `,
					inline: true,
				},
				{
					name: lines[0][2],
					value: `${lines[1][2]} \n${lines[2][2]} \n${lines[3][2]} \n${lines[4][2]} \n${lines[5][2]} `,
					inline: true,
				},
				{
					name: 'Mirror Manager Roles',
					value: managerString,
					inline: false,
				},
				{
					name: 'Silenced Role',
					value: silenceString,
					inline: false,
				}
			);

			var permString = 'Looks like you have all the required permissions to use Mirror in this channel :smile:';
			let channel = interaction.channel as GuildBasedChannel;
			let missingPerms = [];
			let us = await interaction.guild!.members.fetch(bot.client.user!);
			let permissions = channel.permissionsFor(us);
			for (let x in permList) {
				if (!permissions.has(permList[x][1] as PermissionResolvable)) missingPerms.push(permList[x][0].toString());
			}
			if (missingPerms.length > 0) {
				permString = 'Looks like Mirror is missing a few permissions:'
				for (let perm of missingPerms) {
					permString += '\n' + '\`' + perm + '\`';
				}
				permString += '\n' + 'Assign mirror the missing permissions to ensure full functionality'
			}
			embed.addFields({ name: 'Permissions', value: permString });
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
}
