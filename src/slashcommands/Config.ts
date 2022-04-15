import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
	Permissions,
	GuildChannel,
	GuildChannelResolvable,
	PermissionOverwriteManager,
	PermissionResolvable,
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
	['ADD_REACTIONS', Permissions.FLAGS.ADD_REACTIONS],
	['CONNECT', Permissions.FLAGS.CONNECT],
	['EMBED_LINKS', Permissions.FLAGS.EMBED_LINKS],
	['MANAGE_MESSAGES',Permissions.FLAGS.MANAGE_MESSAGES],
	['MOVE_MEMBERS', Permissions.FLAGS.MOVE_MEMBERS],
	['SEND_MESSAGES', Permissions.FLAGS.SEND_MESSAGES],
	['SPEAK', Permissions.FLAGS.SPEAK],
	['USE_EXTERNAL_EMOJIS',Permissions.FLAGS.USE_EXTERNAL_EMOJIS],
	['VIEW_CHANNEL',Permissions.FLAGS.VIEW_CHANNEL]]
	
export class Config implements SlashCommand {
	name: string = 'config';
	description = 'See the configuration settings for this server';
	options = [];
	requiredPermissions: bigint[] = [Permissions.FLAGS.SEND_MESSAGES];
	async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			let embed = new MessageEmbed()
				.setTitle(`:gear: Server Settings for ${interaction.guild?.name}`)
				.setColor(colorCheck(interaction.guild!.id));
			let lines: any[][] = [
				['Setting', 'Description', 'Configuration'],
				['`/update`', 'Mirror development updates', '❌'],
				['`/birthdayconfig`', 'Recieve birthday messages', '❌'],
				['`/defaultvc`', 'Channel Mirror joins automatically', '❌'],
				['`/nsfw`', 'Toggle NSFW settings', '❌'],
				['`/servercolor`','Change Default Color', '❌'],
			];
			let bday = bdayChannels.get(interaction.guild!.id);
			let defaultVoice = defaultVc.get(interaction.guild!.id);
			let update = updateChannels.get(interaction.guild!.id);
			let nsfwToggle = nsfw.get(interaction.guild!.id);
			let silence = silencedRole.get(interaction.guild!.id);
			let serverColor = serverColors.get(interaction.guild!.id);
			if (update) {
				update = bot.client.channels.cache.get(update);
				lines[1][2] = update;
			}
			if (bday) {
				bday = bot.client.channels.cache.get(bday);
				lines[2][2] = bday;
			}
			if (defaultVoice) {
				defaultVoice = bot.client.channels.cache.get(defaultVoice);
				lines[3][2] = defaultVoice;
			}
			if (nsfwToggle == 'on') {
				lines[4][2] = '✅';
			}
			if(serverColor){
				lines[5][2] = serverColor;
			}
			let managerArray = managerRoles.ensure(interaction.guild!.id, []);
			let managerString = '';
			if (managerArray.length == 0) {
				managerString = 'Add Mirror Managers with `/managerrole`';
			} else {
				for (let role of managerArray) {
					let getRole = interaction.guild?.roles.cache.get(role);
					managerString = managerString + `${getRole}` + ', ';
				}
				managerString = managerString.slice(0, -2);
			}
			let silenceString =
				'To prevent someone interacting with Introthemes, Birthday Command or Music\n`/silencerole` or `/silencemember`';
			if (silence) {
				let getRole = interaction.guild?.roles.cache.get(silence);
				silenceString = `${getRole}`;
			}
			embed.addFields(
				{
					name: lines[0][0],
					value: `${lines[1][0]}\n${lines[2][0]}\n${lines[3][0]}\n${lines[4][0]}\n${lines[5][0]}`,
					inline: true,
				},
				{
					name: lines[0][1],
					value: `${lines[1][1]}\n${lines[2][1]}\n${lines[3][1]}\n${lines[4][1]}\n${lines[5][1]}`,
					inline: true,
				},
				{
					name: lines[0][2],
					value: `${lines[1][2]}\n${lines[2][2]}\n${lines[3][2]}\n${lines[4][2]}\n${lines[5][2]}`,
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
			//Check if administrator:
			let channel = interaction.channel as GuildChannel;
			//Check for missing permissions:
			const requiredPermission: bigint[] = [
				Permissions.FLAGS.ADD_REACTIONS,
				Permissions.FLAGS.CONNECT,
				Permissions.FLAGS.EMBED_LINKS,
				Permissions.FLAGS.MANAGE_MESSAGES,
				Permissions.FLAGS.MOVE_MEMBERS,
				Permissions.FLAGS.SEND_MESSAGES,
				Permissions.FLAGS.SPEAK,
				Permissions.FLAGS.USE_EXTERNAL_EMOJIS,
				Permissions.FLAGS.VIEW_CHANNEL
			];

			let missingPerms = [];
			let us = await interaction.guild!.members.fetch(bot.client.user!);
			let permissions = channel.permissionsFor(us);
			for(let x in permList){
				if(!permissions.has(permList[x][1] as PermissionResolvable)) missingPerms.push(permList[x][0].toString());
			}
			if(missingPerms.length > 0){
				permString = 'Looks like Mirror is missing a few permissions:'
				for(let perm of missingPerms){
					permString += '\n' + '\`' + perm + '\`';
				}
			}
			embed.addField('Permissions', permString);
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
