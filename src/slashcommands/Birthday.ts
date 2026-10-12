//Call: Slash command birthday
//Saves the day and month someone was born, so Mirror can wish them a happy birthday
import {
	ApplicationCommandOptionType,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { daysInMonth, longDate, months, monthNumber } from '../resources/birthdayDates';
import { respond } from '../resources/respond';
import { Option } from './Option';
import { silenceCheck } from './SilenceRole';
import { SlashCommand } from './SlashCommand';

export let bdayDates = new Enmap({ name: 'bdayDates' });

export class Birthday implements SlashCommand {
	name: string = 'birthday';
	description =
		'Set your birthday to receive a special message on your birthday!';
	options = [
		new Option(
			'month',
			'Your Birth Month',
			ApplicationCommandOptionType.String,
			true,
			'may',
			months.map((month) => ({ name: month, value: month.toLowerCase() }))
		),
		new Option(
			'day',
			'The date of your birthday',
			ApplicationCommandOptionType.Integer,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	//birthdays are saved for everywhere at once, but the command reads the server's silenced
	//members and color, so it belongs in a server rather than a direct message
	guildRequired?: boolean | undefined = true;
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<void> {
		try {
			//the shared check covers the silenced role as well as the silenced member list
			if (silenceCheck(interaction)) {
				return void (await respond(
					interaction,
					'Silenced users cannot use this command'
				));
			}

			const month = monthNumber(interaction.options.getString('month')!);
			const day = interaction.options.getInteger('day')!;
			//February keeps its 29th, since people born on it still want it saved
			if (!month || day < 1 || day > daysInMonth(month)) {
				return void (await respond(interaction, 'Please enter a valid date'));
			}

			//store the date of birth in numerical form  DD-MM
			bdayDates.set(interaction.user.id, `${day}-${month}`);
			let embed = new EmbedBuilder()
				.setDescription(
					`Successfully set your birthday to: ${longDate({
						memberId: interaction.user.id,
						month,
						day,
					})}`
				)
				.setColor(colorCheck(interaction.guild!.id));
			await respond(interaction, { embeds: [embed] }, false);
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
}
