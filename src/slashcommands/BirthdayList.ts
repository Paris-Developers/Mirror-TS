import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	ContainerBuilder,
	Guild,
	MessageFlags,
	StringSelectMenuBuilder,
	escapeMarkdown,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';
import { accentColor, addHeading, cardReply, commandMention, divider, handleControls } from '../resources/cards';
import {
	Birthday,
	daysAway,
	months,
	nextBirthdays,
	savedBirthday,
	shortDate,
} from '../resources/birthdayDates';

//a month with more birthdays than this is split over several pages, keeping each page readable
//and well inside Discord's limit on text in a message
const perPage = 40;

type Page = { month: number; part: number; parts: number; birthdays: Birthday[] };

export class BirthdayList implements SlashCommand {
	name: string = 'birthdaylist';
	description: string = '[MANAGER] See all the birthdays in the current guild';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [];
	async run(bot: Bot, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
		try {
			await interaction.deferReply();
			const guild = interaction.guild!;

			//birthdays are saved per user, so only members of this server are listed
			const birthdays: Birthday[] = [];
			for (const member of (await guild.members.fetch()).values()) {
				const birthday = savedBirthday(member.id);
				if (birthday) birthdays.push(birthday);
			}
			birthdays.sort((a, b) => a.month - b.month || a.day - b.day);

			const pages = paginate(birthdays);
			const nextUp = nextBirthdays(birthdays);
			//open on the month of the next birthday
			let current = Math.max(0, pages.findIndex((page) => page.month === nextUp[0]?.month));

			const render = (controls: boolean) =>
				birthdayCard(bot, guild, birthdays.length, nextUp, pages, current, controls);
			const message = await interaction.editReply({ components: [render(true)], ...cardReply });
			if (pages.length < 2) return;

			handleControls(
				bot,
				message,
				interaction.user.id,
				async (control) => {
					if (control.isStringSelectMenu()) current = Number(control.values[0]);
					else if (control.customId === 'previous') current = (current - 1 + pages.length) % pages.length;
					else if (control.customId === 'next') current = (current + 1) % pages.length;
					await control.update({ components: [render(true)], allowedMentions: { parse: [] } });
				},
				() => interaction.editReply({ components: [render(false)], allowedMentions: { parse: [] } })
			);
		} catch (err) {
			bot.logger.commandError(interaction.channel!.id, this.name, err);
			const reply = { content: 'Error: contact a developer to investigate', flags: MessageFlags.Ephemeral as const };
			if (interaction.deferred) interaction.followUp(reply);
			else interaction.reply(reply);
		}
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
	blockSilenced?: boolean | undefined;
	musicCommand?: boolean | undefined;
}

function paginate(birthdays: Birthday[]): Page[] {
	const pages: Page[] = [];
	for (let month = 1; month <= 12; month++) {
		const inMonth = birthdays.filter((birthday) => birthday.month === month);
		const parts = Math.ceil(inMonth.length / perPage);
		for (let part = 1; part <= parts; part++) {
			pages.push({ month, part, parts, birthdays: inMonth.slice((part - 1) * perPage, part * perPage) });
		}
	}
	return pages;
}

const pageName = (page: Page) =>
	page.parts > 1 ? `${months[page.month - 1]} (${page.part}/${page.parts})` : months[page.month - 1];

function birthdayCard(
	bot: Bot,
	guild: Guild,
	total: number,
	nextUp: Birthday[],
	pages: Page[],
	current: number,
	controls: boolean
): ContainerBuilder {
	const card = new ContainerBuilder().setAccentColor(accentColor(guild.id));
	const saved = total ? `\n${total} ${total === 1 ? 'birthday' : 'birthdays'} saved` : '';
	addHeading(card, `## 🎂 Birthdays in ${escapeMarkdown(guild.name)}${saved}`, guild.iconURL());

	if (total === 0) {
		card.addTextDisplayComponents((text) =>
			text.setContent(`No birthdays saved yet. Add yours with ${commandMention(bot, 'birthday')}.`)
		);
		return card;
	}

	const names = nextUp.map((birthday) => `<@${birthday.memberId}>`).join(', ');
	card.addTextDisplayComponents((text) =>
		text.setContent(`**Next up:** ${names} · ${shortDate(nextUp[0])} (${daysAway(nextUp[0])})`)
	);
	card.addSeparatorComponents(divider);

	const page = pages[current];
	const lines = page.birthdays.map((birthday) => `\`${shortDate(birthday)}\` · <@${birthday.memberId}>`);
	card.addTextDisplayComponents((text) => text.setContent([`### ${pageName(page)}`, ...lines].join('\n')));

	if (!controls || pages.length < 2) return card;

	card.addSeparatorComponents(divider);
	//one menu entry per month, jumping to the first page of that month
	const menu = new StringSelectMenuBuilder().setCustomId('month').setPlaceholder('Jump to a month');
	pages.forEach((option, index) => {
		if (option.part !== 1) return;
		const count = pages
			.filter((other) => other.month === option.month)
			.reduce((sum, other) => sum + other.birthdays.length, 0);
		menu.addOptions({
			label: `${months[option.month - 1]} (${count})`,
			value: String(index),
			default: option.month === page.month,
		});
	});
	const previous = pages[(current - 1 + pages.length) % pages.length];
	const next = pages[(current + 1) % pages.length];
	card
		.addActionRowComponents(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu))
		.addActionRowComponents(
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder().setCustomId('previous').setLabel(`◀ ${pageName(previous)}`).setStyle(ButtonStyle.Secondary),
				new ButtonBuilder().setCustomId('next').setLabel(`${pageName(next)} ▶`).setStyle(ButtonStyle.Secondary)
			)
		);
	return card;
}
