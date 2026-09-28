//Call: Slash command help
//Shows what Mirror is and its commands, one category at a time
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	PermissionFlagsBits,
	StringSelectMenuBuilder,
} from 'discord.js';
import { Bot } from '../Bot';
import { accentColor, addHeading, cardReply, commandMention, divider, handleControls } from '../resources/cards';
import { SlashCommand } from './SlashCommand';

const supportServer = 'https://discord.gg/uvdg2R5PAU';

type Category = {
	id: string;
	label: string;
	emoji: string;
	blurb: string;
	commands: string[];
	//anything worth knowing that isn't a slash command, shown under the category's list
	note?: string;
};
const categories: Category[] = [
	{
		id: 'voice',
		label: 'Voice and intros',
		emoji: '🔊',
		blurb: 'Mirror joining voice, sound effects, and the intro that plays when you join a channel.',
		commands: ['join', 'leave', 'defaultvc', 'sicko', 'munch', 'intro', 'removeintro'],
	},
	{
		id: 'music',
		label: 'Music',
		emoji: '🎵',
		blurb: 'Play songs from YouTube by name or link, and control the queue.',
		commands: ['play', 'playnext', 'nowplaying', 'queue', 'skip', 'pause', 'resume', 'shuffle', 'loop', 'clearqueue', 'destroyqueue'],
	},
	{
		id: 'fun',
		label: 'Info and fun',
		emoji: '🎲',
		blurb: 'Lookups, birthdays, polls and assorted silliness.',
		commands: ['weather', 'stock', 'nasa', 'birthday', 'birthdaylist', 'poll', 'roll', 'kanye', 'kawaii', 'tickle', 'mirror', 'nut'],
		note: "Right-click anyone (or hold their name on a phone) and pick **Apps → Birthday** to see when it's their birthday.",
	},
	{
		id: 'setup',
		label: 'Server setup',
		emoji: '⚙️',
		blurb: 'Settings for server managers. See everything at once with /config.',
		commands: ['config', 'birthdayconfig', 'defaultvc', 'update', 'managerrole', 'silencemember', 'silencerole', 'nsfw', 'servercolor', 'removeintro'],
	},
	{
		id: 'about',
		label: 'About Mirror',
		emoji: 'ℹ️',
		blurb: 'Where Mirror comes from and how to reach the developers.',
		commands: ['github', 'invite', 'support', 'test'],
	},
];

export class Help implements SlashCommand {
	name: string = 'help';
	description: string = 'Information about the bot';
	options = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	async run(bot: Bot, interaction: ChatInputCommandInteraction): Promise<void> {
		try {
			let current = 'start';
			const render = (controls: boolean) => helpCard(bot, interaction.guild?.id, current, controls);
			const response = await interaction.reply({ components: [render(true)], ...cardReply, withResponse: true });
			const message = response.resource?.message;
			if (!message) return;

			handleControls(
				bot,
				message,
				interaction.user.id,
				async (control) => {
					if (control.isStringSelectMenu()) current = control.values[0];
					await control.update({ components: [render(true)], allowedMentions: { parse: [] } });
				},
				() => interaction.editReply({ components: [render(false)], allowedMentions: { parse: [] } })
			);
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

function helpCard(bot: Bot, guildId: string | undefined, current: string, controls: boolean): ContainerBuilder {
	const card = new ContainerBuilder().setAccentColor(accentColor(guildId));
	addHeading(
		card,
		'## 🪞 Mirror\nInformational and fun Discord bot created by Ford, Zac and Marty.',
		bot.client.user?.displayAvatarURL()
	);
	card.addSeparatorComponents(divider);

	const category = categories.find((c) => c.id === current);
	if (category) {
		const lines = commandsIn(bot, category).map((name) => `${commandMention(bot, name)} · ${descriptionOf(bot, name)}`);
		const note = category.note ? ['', `-# ${category.note}`] : [];
		card.addTextDisplayComponents((text) =>
			text.setContent([`### ${category.emoji} ${category.label}`, category.blurb, '', ...lines, ...note].join('\n'))
		);
	} else {
		card.addTextDisplayComponents((text) =>
			text.setContent(
				[
					'### Getting started',
					'Pick a category below to see its commands. Command names can be clicked to start typing them.',
					'',
					...categories.map((c) => `${c.emoji} **${c.label}** · ${c.blurb}`),
				].join('\n')
			)
		);
	}

	if (!controls) return card;

	card.addSeparatorComponents(divider);
	const menu = new StringSelectMenuBuilder().setCustomId('category').setPlaceholder('Pick a category');
	menu.addOptions({ label: 'Getting started', value: 'start', emoji: '🪞', default: current === 'start' });
	for (const c of categories) {
		menu.addOptions({ label: c.label, value: c.id, emoji: c.emoji, default: c.id === current });
	}
	card
		.addActionRowComponents(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu))
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setLabel('Support server').setStyle(ButtonStyle.Link).setURL(supportServer)
			)
		);
	return card;
}

//a category's commands that actually exist, with any command missing from every category listed
//under About so nothing is left out of help
function commandsIn(bot: Bot, category: Category): string[] {
	const existing = new Set(bot.slashCommands.map((command) => command.name));
	const listed = category.commands.filter((name) => existing.has(name));
	if (category.id !== 'about') return listed;
	const everywhere = new Set(categories.flatMap((c) => c.commands));
	const unlisted = [...existing].filter((name) => !everywhere.has(name) && name !== 'help').sort();
	return [...listed, ...unlisted];
}

function descriptionOf(bot: Bot, name: string): string {
	return bot.slashCommands.find((command) => command.name === name)?.description ?? '';
}
