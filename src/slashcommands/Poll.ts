
//Call: Slash command advpoll
//Returns a custom in depth poll
import {
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Message,
	MessageReaction,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	User,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

const progBar = [
	//remember to index this properly!
	'[                   ]',
	'[■                 ]',
	'[■■                ]',
	'[■■■              ]',
	'[■■■■            ]',
	'[■■■■■          ]',
	'[■■■■■■        ]',
	'[■■■■■■■      ]',
	'[■■■■■■■■    ]',
	'[■■■■■■■■■  ]',
	'[■■■■■■■■■■]',
];
type index = { [index: string]: number };
const emoteIndex: index = {
	'1️⃣': 0,
	'2️⃣': 1,
	'3️⃣': 2,
	'4️⃣': 3,
	'5️⃣': 4,
	'6️⃣': 5,
	'7️⃣': 7,
	'8️⃣': 8,
	'9️⃣': 9,
	'🔟': 10,
};

export class Poll implements SlashCommand {
	name: string = 'poll';
	description: string = 'Create a poll with up to 10 options';
	//I'm not writing the applicationcommandoptiontype property every time. STRING = 3
	options: (Option | Subcommand)[] = [
		new Option('title', 'Set the poll title', 3, true),
		new Option(
			'time',
			'How many minutes you want the poll open',
			ApplicationCommandOptionType.Integer,
			true
		),
		new Option('argument1', 'first poll option', 3, true),
		new Option('argument2', 'second poll option', 3, true),
		new Option('argument3', 'third poll option', 3, false),
		new Option('argument4', 'fourth poll option', 3, false),
		new Option('argument5', 'fifth poll option', 3, false),
		new Option('argument6', 'sixth poll option', 3, false),
		new Option('argument7', 'seventh poll option', 3, false),
		new Option('argument8', 'eigth poll option', 3, false),
		new Option('argument9', 'ninth poll option', 3, false),
		new Option('argument10', 'tenth poll option', 3, false),
	];
	requiredPermissions: bigint[] = [
		PermissionFlagsBits.SendMessages,
		PermissionFlagsBits.ManageMessages,
		PermissionFlagsBits.AddReactions,
		PermissionFlagsBits.EmbedLinks,
	];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			let options = interaction.options.data.slice(2); //Creates a new array of poll options separate from slash options title and time
			//TODO: error test for empty arguments
			let time = interaction.options.getInteger('time')!;
			if (time >= 1500) {
				return interaction.reply({ content: 'Your poll cannot be longer than 24 hours or 1440 minutes', ephemeral: true });
			}

			const embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setTitle(`__${interaction.options.getString('title')} __`)
				.setFooter({
					text: `Poll created by ${interaction.user.tag
						}, open for ${time} minutes.`,
				});
			let emoteVal: index = {
				'1️⃣': 0,
				'2️⃣': 0,
				'3️⃣': 0,
				'4️⃣': 0,
				'5️⃣': 0,
				'6️⃣': 0,
				'7️⃣': 0,
				'8️⃣': 0,
				'9️⃣': 0,
				'🔟': 0,
			};

			//We want to create an array of keys so that we can reference it more easily when writing the embed
			const emoteKeys = Object.keys(emoteVal);

			//fill and send embed with fields for each poll option selected
			let ctr = 0;
			for (let arg of options) {
				embed.addFields({
					name: `${emoteKeys[ctr]} ${arg.value} `,
					value: `${progBar[0]} ** 0 %** `,
					inline: false
				});
				ctr += 1;
			}
			let message = (await interaction.reply({
				embeds: [embed],
				fetchReply: true,
			})) as Message;

			//react to the interaction for each argument
			for (let arg in options) {
				await message.react(emoteKeys[arg]);
			}

			//create a filter to not count bot votes to our reactions
			const filter = (reaction: MessageReaction, user: User) => {
				return !user.bot;
			};

			//creates collector to measure reactions and change the embed as needed
			let total = 0;
			const collector = message.createReactionCollector({
				filter,
				time: time * 60000,
				dispose: true,
			});
			collector.on('collect', (reaction: MessageReaction, user: User) => {
				total += 1;
				emoteVal[reaction.emoji.name!] += 1; //saves number of votes for each emoji
				ctr = 0;
				for (let arg of options) {
					//rewrite the embed and send the edits
					embed.spliceFields(ctr, 1, {
						name: `${emoteKeys[ctr]} ${arg.value} `,
						value: `${progBar[Math.round((emoteVal[emoteKeys[ctr]] / total) * 10)]
							} ** ${Math.round((emoteVal[emoteKeys[ctr]] / total) * 100)}%** `,
						inline: false,
					});
					ctr += 1;
				}
				message.edit({ embeds: [embed] });
			});
			collector.on('remove', (reaction, user) => {
				total = total - 1;
				emoteVal[reaction.emoji.name!] -= 1; //saves number of votes for each emoji
				ctr = 0;
				for (let arg of options) {
					//rewrite the embed and send the edits
					embed.spliceFields(ctr, 1, {
						name: `${emoteKeys[ctr]} ${arg.value} `,
						value: `${progBar[Math.round((emoteVal[emoteKeys[ctr]] / total) * 10)]
							} ${Math.round((emoteVal[emoteKeys[ctr]] / total) * 100)}% `,
						inline: false,
					});
					ctr += 1;
				}
				message.edit({ embeds: [embed] });
			});
			//when the collectors end send a message to the console.
			collector.on('end', (collected) => {
				embed.setFooter({
					text: `Poll created by ${interaction.user.tag}, poll closed.`,
				});
				bot.logger.debug(
					`Ending collection, Collected ${total} items.${emoteVal} `
				);
			});
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
