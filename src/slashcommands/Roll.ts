import {
	CommandInteraction,
	CacheType,
	RichPresenceAssets,
	EmbedBuilder,
	ApplicationCommandOptionType,
} from 'discord.js';
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
			ApplicationCommandOptionType.String,
			false
		),
	];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id));
			if (interaction.options.get('roll')) {
				if (interaction.options.get('roll')?.value == '1dbbq') {
					if (Math.floor(Math.random() * 2 + 0.99) == 1) {
						embed
							.setDescription('Let there be barbeque :smiling_imp:')
							.setImage(
								'https://media2.giphy.com/media/xTiN0K9jW2rSQ6AB6U/giphy.gif'
							);
					} else {
						embed.setDescription('No barbeque :sob:');
					}
					interaction.reply({ embeds: [embed] });
					return;
				}
				let ptrArr = interaction.options.get('roll')!.value as String;
				let array = ptrArr.split('+')
				let rollTotal = 0;
				let rollString = '';
				for (let x of array!) {
					let subStrings = x.split('-');
					if (subStrings.length != 1) {
						interaction.reply('L');
						return;
					}
					let dStrings = x.split('d');
					let y = 0;
					while (y < parseInt(dStrings[0])) {
						let one = Math.floor((Math.random() * 100) / parseInt(dStrings[1]));
						if (isNaN(one)) {
							interaction.reply({
								content: 'Invalid syntax, try something like "2d12"',
							});
							return;
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
					//.setTitle(interaction.options.get('roll')!.value?)
					.setTitle("TODO: Placeholder")
					.setDescription(rollString);
				interaction.reply({ embeds: [embed] });
				return;
			}
			interaction.reply(Math.floor(Math.random() * 6 + 0.99).toString());
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
	guildRequired?: boolean | undefined;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined;
}
