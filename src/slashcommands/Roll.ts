import {
	CommandInteraction,
	CacheType,
	RichPresenceAssets,
	EmbedBuilder,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Roll implements SlashCommand {
	name: string = 'roll';
	description: string = 'Roll a die! (or two or 3) useful for DND';
	options: (Option | Subcommand)[] = [
		new Option(
			'roll',
			'the dice you want to roll',
			ApplicationCommandOptionTypes.STRING,
			false
		),
	];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id));
			if (interaction.options.getString('roll')) {
				if (interaction.options.getString('roll') == '1dbbq') {
					if (Math.floor(Math.random() * 2 + 0.99) == 1) {
						embed
							.setDescription('Let there be barbeque :smiling_imp:')
							.setImage(
								'https://media2.giphy.com/media/xTiN0K9jW2rSQ6AB6U/giphy.gif'
							);
					} else {
						embed.setDescription('No barbeque :sob:');
					}
					return interaction.reply({ embeds: [embed] });
				}
				let array = interaction.options.getString('roll')?.split('+');
				let rollTotal = 0;
				let rollString = '';
				for (let x of array!) {
					let subStrings = x.split('-');
					if (subStrings.length != 1) {
						return interaction.reply('L');
					}
					let dStrings = x.split('d');
					let y = 0;
					while (y < parseInt(dStrings[0])) {
						let one = Math.floor((Math.random() * 100) / parseInt(dStrings[1]));
						if (isNaN(one)) {
							return interaction.reply({
								content: 'Invalid syntax, try something like "2d12"',
							});
						}
						rollTotal += one;
						if (rollString.length > -0) rollString += ' + ';
						rollString += one.toString();
						y++;
					}
				}
				rollString += ' = ';
				rollString += rollTotal.toString();
				embed
					.setTitle(interaction.options.getString('roll')!)
					.setDescription(rollString);
				return interaction.reply({ embeds: [embed] });
			}
			return interaction.reply(Math.floor(Math.random() * 6 + 0.99).toString());
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
	}
	guildRequired?: boolean | undefined;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined;
}
