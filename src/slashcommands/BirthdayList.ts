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
import { bdayDates } from './Birthday';
import { accentColor, addHeading, cardReply, commandMention, divider, handleControls } from '../resources/cards';

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
//a month with more birthdays than this is split over several pages, keeping each page readable
//and well inside Discord's limit on text in a message
const perPage = 40;

type Birthday = { memberId: string; month: number; day: number };
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

			//birthdays are saved per user as DD-MM, so only members of this server are listed
			const birthdays: Birthday[] = [];
			for (const member of (await guild.members.fetch()).values()) {
				const saved = bdayDates.get(member.id);
				if (typeof saved !== 'string') continue;
				const [day, month] = saved.split('-').map(Number);
				if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
					birthdays.push({ memberId: member.id, month, day });
				}
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

//the next date this birthday falls on, today included. Feb 29 falls back to Feb 28 in other years
function nextDate(month: number, day: number, today: Date): Date {
	for (let year = today.getFullYear(); ; year++) {
		let date = new Date(year, month - 1, day);
		if (date.getMonth() !== month - 1) date = new Date(year, month, 0);
		if (date >= today) return date;
	}
}

function startOfToday(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

//everyone whose birthday is the soonest one coming up
function nextBirthdays(birthdays: Birthday[]): Birthday[] {
	const today = startOfToday();
	let soonest = Infinity;
	let found: Birthday[] = [];
	for (const birthday of birthdays) {
		const time = nextDate(birthday.month, birthday.day, today).getTime();
		if (time < soonest) {
			soonest = time;
			found = [birthday];
		} else if (time === soonest) {
			found.push(birthday);
		}
	}
	return found;
}

function daysAway(birthday: Birthday): string {
	const today = startOfToday();
	const days = Math.round((nextDate(birthday.month, birthday.day, today).getTime() - today.getTime()) / 86400000);
	if (days === 0) return 'today 🎉';
	if (days === 1) return 'tomorrow';
	return `in ${days} days`;
}

const shortDate = (birthday: Birthday) =>
	`${months[birthday.month - 1].slice(0, 3)} ${String(birthday.day).padStart(2, '0')}`;

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
