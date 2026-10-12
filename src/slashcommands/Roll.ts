import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';

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
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor(colorCheck(interaction.guild!.id));
			if (interaction.options.getString('roll')) {
				if (interaction.options.getString('roll') == '1dbbq') {
					if (Math.floor(Math.random() * 2) == 1) {
						embed
							.setDescription('Let there be barbeque :smiling_imp:')
							.setImage(
								'https://media2.giphy.com/media/xTiN0K9jW2rSQ6AB6U/giphy.gif'
							);
					} else {
						embed.setDescription('No barbeque :sob:');
					}
					return void interaction.reply({ embeds: [embed] });
				}
				let array = interaction.options.getString('roll')?.split('+');
				let rollTotal = 0;
				let rollString = '';
				for (let x of array!) {
					let subStrings = x.split('-');
					if (subStrings.length != 1) {
						return void interaction.reply('L');
					}
					let dStrings = x.split('d');
					//"d20" is one d20: people write it that way, and without this it rolled nothing
					//at all and reported a total of 0
					let dice = dStrings[0].trim() === '' ? 1 : parseInt(dStrings[0]);
					let sides = parseInt(dStrings[1]);
					if (isNaN(dice) || isNaN(sides) || dice < 1 || sides < 1) {
						return void interaction.reply({
							content: 'Invalid syntax, try something like "2d12"',
						});
					}
					let y = 0;
					while (y < dice) {
						let one = Math.floor(Math.random() * sides) + 1;
						rollTotal += one;
						if (rollString.length > 0) rollString += ' + ';
						rollString += one.toString();
						y++;
					}
				}
				rollString += ' = ';
				rollString += rollTotal.toString();
				embed
					.setTitle(interaction.options.getString('roll')!)
					.setDescription(rollString);
				return void interaction.reply({ embeds: [embed] });
			}
			return void interaction.reply((Math.floor(Math.random() * 6) + 1).toString());
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined;
}
