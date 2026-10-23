//Call: Slash command poll
//Returns a custom in depth poll
import {
	EmbedBuilder,
	CacheType,
	ChatInputCommandInteraction,
	User,
	MessageReaction,
	ApplicationCommandOptionType,
	PermissionFlagsBits,
} from 'discord.js';
import { Bot } from '../Bot';
import { colorCheck } from '../resources/embedColorCheck';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { respond } from '../resources/respond';

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
		new Option('argument8', 'eighth poll option', 3, false),
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
	): Promise<void> {
		try {
			let options = interaction.options.data.slice(2); //Creates a new array of poll options separate from slash options title and time
			//TODO: error test for empty arguments
			let time = interaction.options.getInteger('time')!;
			//a poll of no minutes leaves a collector running with nothing to stop it
			if (time < 1 || time > 1440) {
				return void (await respond(
					interaction,
					'Your poll must be open between 1 minute and 24 hours or 1440 minutes'
				));
			}

			const embed = new EmbedBuilder()
				.setColor(colorCheck(interaction.guild!.id))
				.setTitle(`__${interaction.options.getString('title')}__`)
				.setFooter({
					text: `Poll created by ${
						interaction.user.tag
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
			//only the numbers this poll actually offered are votes; anything else is someone reacting
			const pollEmotes = emoteKeys.slice(0, options.length);

			//fill and send embed with fields for each poll option selected
			let ctr = 0;
			for (let arg of options) {
				embed.addFields({
					name: `${emoteKeys[ctr]} ${arg.value}`,
					value: `${progBar[0]} **0%**`,
					inline: false,
				});
				ctr += 1;
			}
			await interaction.reply({ embeds: [embed] });
			let message = await interaction.fetchReply();

			//react to the interaction for each argument
			for (let arg in options) {
				await message.react(emoteKeys[arg]);
			}

			//a bot's own reactions aren't votes, and neither is a reaction that isn't one of the options:
			//counting those made the percentages add up to less than the votes cast
			const filter = (reaction: MessageReaction, user: User) => {
				return !user.bot && pollEmotes.includes(reaction.emoji.name!);
			};

			//creates collector to measure reactions and change the embed as needed
			let total = 0;
			const collector = message.createReactionCollector({
				filter,
				time: time * 60000,
				dispose: true,
			});
			//every bar moves when one vote comes in or goes out, so both handlers redraw all of them.
			//only one edit is out at a time. Discord limits how often a bot may edit in a channel, and every
			//vote used to send its own edit, so a busy poll (or one person flicking a reaction on and off)
			//queued edits in memory faster than they could go out, and held up Mirror's other edits there.
			//a vote that comes in while an edit is out just asks for one more redraw once it's done
			let editing = false;
			let redrawAgain = false;
			const redraw = () => {
				if (editing) {
					redrawAgain = true;
					return;
				}
				editing = true;
				let field = 0;
				for (let arg of options) {
					//the last vote going away leaves nothing to divide by, which read as "undefined NaN%"
					const share = total > 0 ? emoteVal[emoteKeys[field]] / total : 0;
					embed.spliceFields(field, 1, {
						name: `${emoteKeys[field]} ${arg.value}`,
						value: `${progBar[Math.round(share * 10)]} **${Math.round(
							share * 100
						)}%**`,
						inline: false,
					});
					field += 1;
				}
				message
					.edit({ embeds: [embed] })
					.catch((err) => bot.logger.warn('Could not update a poll:', err))
					.finally(() => {
						editing = false;
						if (redrawAgain) {
							redrawAgain = false;
							redraw();
						}
					});
			};
			collector.on('collect', (reaction: MessageReaction, user: User) => {
				total += 1;
				emoteVal[reaction.emoji.name!] += 1; //saves number of votes for each emoji
				redraw();
			});
			collector.on('remove', (reaction, user) => {
				total -= 1;
				emoteVal[reaction.emoji.name!] -= 1; //saves number of votes for each emoji
				redraw();
			});
			//when the collectors end send a message to the console.
			collector.on('end', (collected) => {
				embed.setFooter({
					text: `Poll created by ${interaction.user.tag}, poll closed.`,
				});
				//the closed footer only reaches anyone if the poll itself is edited
				redraw();
				bot.logger.debug(`Ending collection, Collected ${total} items.`, emoteVal);
			});
		} catch (err) {
			bot.logger.commandError(interaction.channelId, this.name, err);
			await respond(interaction, 'Error: contact a developer to investigate');
			return;
		}
	}
	guildRequired?: boolean | undefined = true;
}
