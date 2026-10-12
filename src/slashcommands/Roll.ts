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
				const rolled = rollDice(interaction.options.getString('roll')!);
				if ('problem' in rolled) {
					return void interaction.reply({ content: rolled.problem });
				}
				let rollString = rolled.shown;
				//one die has nothing to add up, so "16 = 16" is just noise
				if (rollString !== rolled.total.toString()) rollString += ` = ${rolled.total}`;
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

//the most dice one command may roll. 4096 characters is all an embed's description holds, and
//each die costs a few, so a huge roll used to fail with "contact a developer"
const maxDice = 100;

//reads what someone typed: dice (2d6, d20), flat numbers (+4), and either joined with + or -.
//"shown" is each die and modifier in the order they were written, so people can check the maths
function rollDice(input: string): { shown: string; total: number } | { problem: string } {
	const invalid = { problem: 'Invalid syntax, try something like "1d20+1d4+4"' };
	//keep each term with the sign in front of it, so "1d20+1d4-2" splits into +1d20, +1d4, -2
	const terms = input.replace(/\s+/g, '').match(/[+-]?[^+-]+/g);
	if (!terms) return invalid;

	let total = 0;
	let shown = '';
	let dice = 0;
	for (const term of terms) {
		const negative = term.startsWith('-');
		const body = term.replace(/^[+-]/, '');
		const add = (value: number, text: string) => {
			total += negative ? -value : value;
			if (shown) shown += negative ? ' - ' : ' + ';
			else if (negative) shown += '-';
			shown += text;
		};

		//a flat modifier, as in the +4 of 1d20+4
		if (/^\d+$/.test(body)) {
			add(Number(body), body);
			continue;
		}

		const parts = body.match(/^(\d*)d(\d+)$/i);
		if (!parts) return invalid;
		//"d20" is one d20: people write it that way, and it used to roll nothing at all
		const count = parts[1] === '' ? 1 : Number(parts[1]);
		const sides = Number(parts[2]);
		if (count < 1 || sides < 1) return invalid;
		dice += count;
		if (dice > maxDice) return { problem: `That's a lot of dice. ${maxDice} at a time is the limit.` };

		for (let rolled = 0; rolled < count; rolled++) {
			const value = Math.floor(Math.random() * sides) + 1;
			add(value, value.toString());
		}
	}
	return { shown, total };
}
