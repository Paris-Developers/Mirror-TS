import { CommandInteraction, CacheType, EmbedBuilder, User } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

const nuts = new Enmap({name:'nuts', fetchAll: true});
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
		new Subcommand('leaderboard', 'View the servers nut leaderboard', []),
	];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor('#FDA50F');
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
			if(interaction.options.getSubcommand() == 'leaderboard'){
				nuts.fetchEverything();
				let guild = interaction.guild!;
				let leaderboard: any[][] = [];
				for(const item of nuts){
					try{
						let member = await guild.members.fetch(item[0].toString());
						leaderboard.push([member.user.username, item[1]]);
					} catch(err) {
					}
				}
				leaderboard = sort(leaderboard);
				var userString = '';
				var nutString = '';
				let ctr = 1;
				for(let x of leaderboard){
					if(x[0]==interaction.user.username){
						embed.setFooter({text: `Your rank: ${ctr} of ${leaderboard.length}`, iconURL: interaction.user.avatarURL()!});
					}
					userString += x[0] + '\n';
					nutString += x[1] + '\n';
					ctr ++;
					if(ctr >=16) break;
				}
				embed.addFields({
					name:'🤓 Users',
					value: userString,
					inline: true
				},{
					name: '🥜 Nuts',
					value: nutString,
					inline: true,
				});
				embed.setTitle(`Nut leaderboard for ${interaction.guild!.name}`);
				interaction.reply({embeds:[embed]});
				return;
			};
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				ephemeral: true,
			});
		}
	}

	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined = true;
}
var sort = function(arr: any[]){
	arr.sort(function (a,b){
		if(a[1] <b[1]){
			return 1;
		}
		if(a[1] > b[1]){
			return -1;
		}
		return 0;
	})
	return arr;
}
