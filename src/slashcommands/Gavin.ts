//this is blatant bait to get gavin to work on mirror
//Call: Slash command gavin
//Returns Gavins gym PR's, options to allow you to set new PRs from the text channel.

import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	Permissions,
	MessageEmbed,
	Options,
} from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

//If you add choices to a slash command's options, they will be the only thing a user can select/input.
//This is perfect for validating input before we even have the command run on our side.
const liftChoices = [
	{
		name: 'Deadlift',
		value: 'deadlift',
	},
	{
		name: 'Bench',
		value: 'bench',
	},
	{
		name: 'Squat',
		value: 'squat',
	},
];
let gav_records = new Enmap({ name: 'gav_records' }); //named enmaps are persistent to the disk
//dirt whore
export class Gavin implements SlashCommand {
	name: string = 'gavin';
	description: string = 'Gavins personal records';
	options: (Option | Subcommand)[] = [
		new Subcommand('all', 'print all of the lift data'),
		new Subcommand('lift', "show a specific lift's data", [
			new Option(
				'lifttype',
				'the lift to display',
				ApplicationCommandOptionTypes.STRING,
				true,
				'deadlift',
				liftChoices
			),
		]),
		new Subcommand('setlift', "set a specific lift's data", [
			new Option(
				'lifttype',
				'the lift to set',
				ApplicationCommandOptionTypes.STRING,
				true,
				'deadlift',
				liftChoices
			),
			new Option(
				'lift',
				'the lift record',
				ApplicationCommandOptionTypes.NUMBER,
				true,
				1
			),
		]),
	];
	requiredPermissions: bigint[] = [
		Permissions.FLAGS.SEND_MESSAGES,
		Permissions.FLAGS.EMBED_LINKS,
	];
	async run(bot: Bot, interaction: CommandInteraction): Promise<void> {
		try {
			const options = interaction.options;
			if (options.getSubcommand() == 'all') {
				// subcommand for printing all the data
				let bench = gav_records.ensure('bench', 365);
				let squat = gav_records.ensure('squat', 445);
				let deadlift = gav_records.ensure('deadlift', 605);
				const embed = new MessageEmbed()
					.setColor('#FFFFFF')
					.setDescription(
						`GAVIN'S CURRENT PRS:\n BENCH: ${bench} LB \n SQUAT: ${squat} LB \n DEADLIFT: ${deadlift} LB \n`
					);
				interaction.reply({ embeds: [embed] });
				return;
			}
			if (options.getSubcommand() == 'lift') {
				// subcommand for displaying just one lift
				let toprint;
				let type = options.getString('lifttype');
				if (type == 'bench') toprint = gav_records.ensure('bench', 365);
				if (type == 'squat') toprint = gav_records.ensure('squat', 445);
				if (type == 'deadlift') toprint = gav_records.ensure('deadlift', 605);
				if (!toprint) {
					//theoretically, this will never run because we are using slash command choices
					bot.logger.warn(`${this.name} ran without a valid Choice selected`);
					interaction.reply('INVALID LOOKUP');
					return;
				}
				const embed = new MessageEmbed()
					.setColor('#FFFFFF')
					.setDescription(`GAVIN'S ${type!.toUpperCase()} PR: ${toprint}`);
				interaction.reply({ embeds: [embed] });
				return;
			}
			if (options.getSubcommand() == 'setlift') {
				// we're setting data now
				let type = options.getString('lifttype'); // key to set to
				let lift = options.getNumber('lift'); // the data to set
				if (type == 'bench') gav_records.set('bench', lift);
				if (type == 'squat') gav_records.set('squat', lift);
				if (type == 'deadlift') gav_records.set('deadlift', lift);

				const embed = new MessageEmbed()
					.setColor('#FFFFFF')
					.setDescription(
						`UPDATED GAVIN'S ${type!.toUpperCase()} PR TO: ${lift}\nGOOD JOB SOLDIER`
					);
				interaction.reply({ embeds: [embed] });
				return;
			}
			bot.logger.warn(`${this.name} finished without hiting a subcommand`);
			//slash commands make it pretty easy to validate user input before the command is actually run, so theoretically this shouldn't ever run either.
			interaction.reply('Something screwed up. This should never happen.');
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
			return;
		}
	}
}
