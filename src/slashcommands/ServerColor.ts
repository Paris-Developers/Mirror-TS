import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
} from 'discord.js';
import { normalizeColor } from '../resources/embedColorCheck';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';

export const serverColors = new Enmap({ name: 'serverColors' });

export class ServerColor implements SlashCommand {
	name: string = 'servercolor';
	description: string = '[MANAGER] Set the color to be used in Mirror message embeds';
	options: (Option | Subcommand)[] = [
		new Option(
			'color',
			'The color you want to set',
			ApplicationCommandOptionType.String,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			let color = normalizeColor(interaction.options.getString('color')!.toUpperCase());
			const embed = new EmbedBuilder();
			try {
				//setColor is the only thing that knows which colors Discord will take
				embed.setColor(color).setDescription('This is your new server color!');
			} catch {
				return void (await respond(
					interaction,
					'Invalid color, please try again with format: \'#ABC123\' or Blue or Random'
				));
			}
			serverColors.set(interaction.guild!.id, color);
			return void (await interaction.reply({ embeds: [embed] }));
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
