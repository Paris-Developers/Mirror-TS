import { CommandInteraction, CacheType, MessageEmbed } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

const nuts = new Enmap('nuts');
const gifArray = [
	'https://media.giphy.com/media/j6ZW4QRTVTuWNsDlUV/giphy.gif',
	'https://i.imgur.com/Fi6pnvQ.gif',
	'https://c.tenor.com/injWPZSrCK0AAAAC/bear.gif',
	'https://w7.pngwing.com/pngs/449/874/png-transparent-javaserver-pages-computer-icons-jar-icon-text-rectangle-logo-thumbnail.png',
];

export class Nut implements SlashCommand {
	name: string = 'nut';
	description: string = 'Add or remove a nut from the jar';
	options: (Option | Subcommand)[] = [
		new Subcommand('reset', 'Resets your jar', []),
		new Subcommand('add', 'Add nuts to the jar', [
			new Option(
				'change',
				'how many nuts to add',
				ApplicationCommandOptionTypes.INTEGER,
				true
			),
		]),
		new Subcommand('subtract', 'Remove nuts to the jar', [
			new Option(
				'change',
				'How many nuts to remove',
				ApplicationCommandOptionTypes.INTEGER,
				true
			),
		]),
	];
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new MessageEmbed().setColor('#FDA50F');
			if (
				Math.random() == 0.69 ||
				Math.random() == 0.42 ||
				Math.random() == 1 ||
				Math.random() == 0
			) {
				let index = Math.floor((Math.random() * 100) / 7);
				embed.setImage(gifArray[index]);
			}

			if (interaction.options.getSubcommand() == 'add') {
				let storage = nuts.ensure(interaction.user.id, 0);
				storage += interaction.options.getInteger('change')!;
				nuts.set(interaction.user.id, storage);
				embed.setDescription(
					`Successfully added ${interaction.options.getInteger(
						'change'
					)} to your jar, your new total is ${storage}`
				);
				return interaction.reply({ embeds: [embed] });
			}
			if (interaction.options.getSubcommand() == 'subtract') {
				let storage = nuts.ensure(interaction.user.id, 0);
				storage -= interaction.options.getInteger('change')!;
				nuts.set(interaction.user.id, storage);
				embed.setDescription(
					`Successfully removed ${interaction.options.getInteger(
						'change'
					)} from your jar, your new total is ${storage}`
				);
				return interaction.reply({ embeds: [embed] });
			}
			if (interaction.options.getSubcommand() == 'reset') {
				nuts.set(interaction.user.id, 0);
				embed
					.setDescription('Your jar has been emptied')
					.setImage('https://c.tenor.com/injWPZSrCK0AAAAC/bear.gif');
				return interaction.reply({ embeds: [embed] });
			}
			return interaction.reply(':eyes:');
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
