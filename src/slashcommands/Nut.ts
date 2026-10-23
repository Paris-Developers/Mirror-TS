import {
	ChatInputCommandInteraction,
	CacheType,
	EmbedBuilder,
	ApplicationCommandOptionType,
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';

const nuts = new Enmap({ name: 'nuts' });
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
				ApplicationCommandOptionType.Integer,
				false
			),
			new Option(
				'user',
				'whos jar to add nuts to',
				ApplicationCommandOptionType.User,
				false
			),
		]),
		new Subcommand('subtract', 'Remove nuts to the jar', [
			new Option(
				'change',
				'How many nuts to remove',
				ApplicationCommandOptionType.Integer,
				false
			),
			new Option(
				'user',
				'whos jar to subtract nuts from',
				ApplicationCommandOptionType.User,
				false
			),
		]),
		new Subcommand('leaderboard', 'View the servers nut leaderboard', []),
	];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			const embed = new EmbedBuilder().setColor('#FDA50F');
			//a rare treat: asking Math.random() for an exact 0.69 never paid out, and the index it
			//picked ran well past the end of the array
			if (Math.random() < 0.05) {
				let index = Math.floor(Math.random() * gifArray.length);
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
				return void interaction.reply({ embeds: [embed] });
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
				return void interaction.reply({ embeds: [embed] });
			}
			if (interaction.options.getSubcommand() == 'reset') {
				nuts.set(interaction.user.id, 0);
				embed
					.setDescription('Your jar has been emptied')
					.setImage('https://c.tenor.com/injWPZSrCK0AAAAC/bear.gif');
				return void interaction.reply({ embeds: [embed] });
			}
			if(interaction.options.getSubcommand() == 'leaderboard'){
				//finding out who is in the server can take longer than Discord waits for an answer
				await interaction.deferReply();
				let guild = interaction.guild!;
				//jars aren't kept per server, so only this server's members are ranked. they come in one
				//request for the whole server, or straight from memory once Mirror knows everyone, rather
				//than one request for every jar anyone anywhere has. if Discord turns the request down
				//(it limits how often it's asked), the members Mirror already knows are ranked
				const members =
					guild.members.cache.size >= guild.memberCount
						? guild.members.cache
						: await guild.members.fetch({ time: 15 * 1000 }).catch(() => guild.members.cache);
				let leaderboard: any[][] = [];
				for(const item of nuts.entries()){
					const member = members.get(item[0].toString());
					if (member) leaderboard.push([member.user.username, item[1]]);
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
				await interaction.editReply({embeds:[embed]});
				return;
			};
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			return void (await respond(interaction, 'Error: contact a developer to investigate'));
		}
	}

	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	//silencing covers intros, music and birthdays, which the jar is none of
	blockSilenced?: boolean | undefined;
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
