import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CacheType,
	MessageEmbed,
} from 'discord.js';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Boey implements SlashCommand {
	name: string = 'boey';
	registerData: ChatInputApplicationCommandData = {
		name: this.name,
		description: 'Sends Boeys stream information!',
	};
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: CommandInteraction<CacheType>
	): Promise<boolean> {
		let boey = await bot.client.users.fetch('331511682155282432');
		const embed = new MessageEmbed()
			.setColor('#6441a5')
			.setTitle(':otter: **__BOEY STREAM HERE__**')
			.setURL('https://www.twitch.tv/kanganya')
			.setDescription(
				':goat: Come watch mamas slay the competition <:power_cry:759835413296316496>'
			)
			.setThumbnail(boey.displayAvatarURL());
		interaction.reply({ embeds: [embed] });
		return true;
	}
}
