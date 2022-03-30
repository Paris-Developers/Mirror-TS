import { CommandInteraction, CacheType, MessageEmbed, User } from 'discord.js';
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
				false
			),
			new Option(
				'user',
				'whos jar to add nuts to',
				ApplicationCommandOptionTypes.USER,
				false
			),
		]),
		new Subcommand('subtract', 'Remove nuts to the jar', [
			new Option(
				'change',
				'How many nuts to remove',
				ApplicationCommandOptionTypes.INTEGER,
				false
			),
			new Option(
				'user',
				'whos jar to subtract nuts from',
				ApplicationCommandOptionTypes.USER,
				false
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
				let messageContent = true;
				let change = interaction.options.getInteger('change');
				let jarUser = interaction.options.getUser('user');
				if (!change) change = 1; //if no change is provided, set to one.
				if (!jarUser) {
					//if no user is provided, set it to the user.
					jarUser = interaction.user;
					messageContent = false;
				}
				let storage = nuts.ensure(jarUser.id, 0);
				storage += change;
				nuts.set(jarUser.id, storage);
				embed.setDescription(
					`Successfully added ${change} to ${
						messageContent ? `${jarUser}'s` : 'your'
					} jar, the new total is ${storage}`
				);
				return interaction.reply({ embeds: [embed] });
			}

			if (interaction.options.getSubcommand() == 'subtract') {
				let messageContent = true;
				let change = interaction.options.getInteger('change');
				let jarUser = interaction.options.getUser('user');
				if (!change) change = 1; //if no change is provided, set to one.
				if (!jarUser) {
					//if no user is provided, set it to the user.
					jarUser = interaction.user;
					messageContent = false;
				}
				let storage = nuts.ensure(jarUser.id, 0);
				storage -= change;
				nuts.set(jarUser.id, storage);
				embed.setDescription(
					`Successfully subtracted ${change} from ${
						messageContent ? `${jarUser}'s` : 'your'
					} jar, the new total is ${storage}`
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
