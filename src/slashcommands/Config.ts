import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

import { bdayChannels } from './Birthday';
import { defaultVc } from './DefaultVc';
import { updateChannels } from './Update';

export class Config implements SlashCommand {
	name: string = 'config';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'See the configuration settings for this server',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		let embed = new MessageEmbed();
		let lines: any[][] = [
			['Setting', 'Description', 'Configuration'],
			['`/update`', 'Mirror development updates', '❌'],
			['`/birthdayconfig`', 'Recieve birthday messages', '❌'],
			['`/defaultvc`', 'Channel Mirror joins automatically', '❌'],
		];
		let bday = bdayChannels.get(interaction.guild!.id);
		let defaultVoice = defaultVc.get(interaction.guild!.id);
		let update = updateChannels.get(interaction.guild!.id);
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
		embed.addFields(
			{
				name: lines[0][0],
				value: `${lines[1][0]}\n${lines[2][0]}\n${lines[3][0]}`,
				inline: true,
			},
			{
				name: lines[0][1],
				value: `${lines[1][1]}\n${lines[2][1]}\n${lines[3][1]}`,
				inline: true,
			},
			{
				name: lines[0][2],
				value: `${lines[1][2]}\n${lines[2][2]}\n${lines[3][2]}`,
				inline: true,
			}
		);
		return interaction.reply({ embeds: [embed] });
	}
	guildRequired?: boolean | undefined = true;
}
