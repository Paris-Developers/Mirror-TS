import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { bdayChannels } from './BirthdayConfig';
import { defaultVc } from './DefaultVc';
import { updateChannels } from './Update';
import { nsfw } from './Nsfw';
import { managerRoles } from './ManagerRole';

export class Config implements SlashCommand {
	name: string = 'config';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'See the configuration settings for this server',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			let embed = new MessageEmbed().setTitle(
				`:gear: Server Settings for ${interaction.guild?.name}`
			);
			let lines: any[][] = [
				['Setting', 'Description', 'Configuration'],
				['`/update`', 'Mirror development updates', '❌'],
				['`/birthdayconfig`', 'Recieve birthday messages', '❌'],
				['`/defaultvc`', 'Channel Mirror joins automatically', '❌'],
				['`/nsfw`', 'Toggle NSFW settings', '❌'],
			];
			let bday = bdayChannels.get(interaction.guild!.id);
			let defaultVoice = defaultVc.get(interaction.guild!.id);
			let update = updateChannels.get(interaction.guild!.id);
			let nsfwToggle = nsfw.get(interaction.guild!.id);
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
			let managerArray = managerRoles.ensure(interaction.guild!.id, []);
			let managerString = '';
			if (managerArray.length == 0) {
				managerString = 'Add Mirror Managers with `/managerroles`';
			} else {
				for (let role of managerArray) {
					let getRole = interaction.guild?.roles.cache.get(role);
					managerString = managerString + `${getRole}` + ', ';
				}
				managerString = managerString.slice(0, -2);
			}
			embed.addFields(
				{
					name: lines[0][0],
					value: `${lines[1][0]}\n${lines[2][0]}\n${lines[3][0]}\n${lines[4][0]}`,
					inline: true,
				},
				{
					name: lines[0][1],
					value: `${lines[1][1]}\n${lines[2][1]}\n${lines[3][1]}\n${lines[4][1]}`,
					inline: true,
				},
				{
					name: lines[0][2],
					value: `${lines[1][2]}\n${lines[2][2]}\n${lines[3][2]}\n${lines[4][2]}`,
					inline: true,
				},
				{
					name: 'Mirror Manager Roles',
					value: managerString,
					inline: false,
				}
			);
			return interaction.reply({ embeds: [embed] });
		} catch (err) {
			bot.logger.error(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin to investigate.',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined = true;
}
