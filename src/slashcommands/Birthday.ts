//Call: Slash command birthday
//Saves the day and month someone was born, so Mirror can wish them a happy birthday
import {
	ApplicationCommandOptionType,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	MessageFlags,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { daysInMonth, longDate, months, monthNumber } from '../resources/birthdayDates';
import { Option } from './Option';
import { silencedUsers } from './SilenceMember';
import { SlashCommand } from './SlashCommand';

export let bdayDates = new Enmap({ name: 'bdayDates' });

export class Birthday implements SlashCommand {
	name: string = 'birthday';
	description =
		'Set your birthday to recieve a special message on your birthday!';
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
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			if (userArray.includes(interaction.user.id)) {
				return void interaction.reply({
					content: 'Silenced users cannot use this command',
					flags: MessageFlags.Ephemeral,
				});
			}

			const month = monthNumber(interaction.options.getString('month')!);
			const day = interaction.options.getInteger('day')!;
			//February keeps its 29th, since people born on it still want it saved
			if (!month || day < 1 || day > daysInMonth(month)) {
				return void interaction.reply({
					content: 'Please enter a valid date',
					flags: MessageFlags.Ephemeral,
				});
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
			interaction.reply({ embeds: [embed] });
			return;
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	}
}
