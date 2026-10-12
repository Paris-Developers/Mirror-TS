//Mirror answering a link that Discord won't preview (/embedfix). X, Instagram and TikTok either turn
//Discord's crawler away or hand it a blank card, so a member's link arrives as bare text. Mirror
//replies with the same post pointed at a fixer that does serve the crawler, and then hides the
//original's empty embed where it is allowed to.
//
//a bot cannot edit someone else's message, so this is a reply rather than an edit, and the reply is
//Mirror's own message under Mirror's name.
//
//Mirror never fetches a member's link. It rewrites the text and posts it, and Discord's crawler does
//the fetching, the same rule the project adopted when the music player stopped resolving arbitrary
//member links.
import Enmap from 'enmap';
import { Message, PermissionFlagsBits } from 'discord.js';
import { Bot } from '../Bot';
import { silenceCheck } from '../slashcommands/SilenceRole';
import { fixerHosts, fixerRules } from './fixerRules';
import { handledHere } from './instanceGuard';

//at most this many links are answered in one message. a wall of links would be a wall of replies
const maxLinks = 2;
//per channel: this many fixes in this long, so one person pasting a feed can't flood a channel
const maxFixesPerChannel = 3;
const cooldownWindow = 30 * 1000;
//channels remembered for the cooldown before the quiet ones are forgotten
const maxRememberedChannels = 500;
//Discord writes its own embed onto a message shortly after delivering it, and suppressing before
//that arrives does nothing. NEEDS ONE CHECK IN A REAL SERVER: if the empty embed is still there
//afterwards, this wait is too short
const suppressDelay = 1500;

//per server: whether Mirror rewrites links that don't embed. off unless a manager turns it on.
//read with .get(...) === true rather than .ensure, so reading a setting doesn't write a row for
//every server Mirror is in
export const embedFix = new Enmap({ name: 'embedFix' });
export function embedFixOn(guildId: string): boolean {
	return embedFix.get(guildId) === true;
}

export type FixResult = {
	//the rewritten links to post, in the order they appeared, deduped and capped
	links: string[];
	//whether every link in the message that would have embedded is one of these. suppressing an
	//embed is all or nothing, so a message with a working link in it as well has to keep its embeds
	allFixed: boolean;
	//links past the cap, so the log can say they were dropped
	skipped: number;
};

//every pattern below is bounded and runs once over the message: a member can paste text of any
//length, and nothing here may be made to backtrack over it
const fencedCode = /```[\s\S]*?```/g;
const inlineCode = /``[^`]*``|`[^`\n]*`/g;
const spoiler = /\|\|[\s\S]*?\|\|/g;
//) and ] are left out so a markdown [text](url) link's closing bracket isn't swallowed. an optional
//leading < is captured, to tell an <url> apart from a bare one
const linkPattern = /(<?)(https?:\/\/[^\s<>()[\]"'`|\\]+)/g;
//a link at the end of a sentence picks up whatever was after it
const trailingPunctuation = /[.,!?;:'"*_~]+$/;

//none of these embed, so there is nothing in them to fix, and a link inside one is not a link the
//member wanted previewed. order matters: a fence can contain backticks and bars
function visibleText(content: string): string {
	return content.replace(fencedCode, ' ').replace(inlineCode, ' ').replace(spoiler, ' ');
}

//the host without the prefixes Discord and the fixers treat as the same site. stripped off the
//front, never matched as a suffix: endsWith('x.com') would also accept x.com.evil.test
function bareHost(hostname: string): string {
	let host = hostname.toLowerCase();
	for (const prefix of ['www.', 'm.', 'mobile.']) {
		if (host.startsWith(prefix)) host = host.slice(prefix.length);
	}
	return host;
}

//whether a link is already pointed at a fixer, so Mirror never re-fixes its own reply or another
//bot's. the fixers each run several subdomains (vm.tnktok.com, d.fxtwitter.com and so on), so this
//one does match below the listed name -- with the dot included, which is what keeps it from
//accepting tnktok.com.evil.test. over-skipping here only means a link is left alone
function isFixerHost(host: string): boolean {
	return fixerHosts.some((fixer) => host === fixer || host.endsWith(`.${fixer}`));
}

//the fixed link for one url, or nothing when Mirror has no rule for it
function fixLink(raw: string): string | undefined {
	let url: URL;
	try {
		url = new URL(raw);
	} catch {
		return undefined;
	}
	//a javascript: or data: url can't reach the regexes above, but say so rather than rely on that
	if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
	const host = bareHost(url.hostname);
	if (isFixerHost(host)) return undefined;
	for (const rule of fixerRules) {
		if (!rule.enabled) continue;
		//an exact host, so a lookalike domain is not this site
		if (!rule.hosts.includes(host)) continue;
		if (rule.skipPaths?.some((skip) => skip.test(url.pathname))) return undefined;
		for (const pattern of rule.patterns) {
			const found = pattern.match.exec(url.pathname);
			if (!found) continue;
			//the query string is dropped: it is tracking, and the fixers look a post up by its id
			const fixed = pattern.template.replace(/\$(\d)/g, (_, group) => found[Number(group)] ?? '');
			//a rewrite that changes nothing would just repeat what the member already posted
			return fixed === raw ? undefined : fixed;
		}
	}
	return undefined;
}

//the pure half of the feature: which links in a message Mirror would answer, and with what. no
//Discord objects, so it can be checked on its own
export function fixableLinks(content: string): FixResult {
	const text = visibleText(content);
	const links: string[] = [];
	const posted = new Set<string>();
	//links that would have embedded, and how many of them these replies cover
	let embeddable = 0;
	let rewritten = 0;
	let skipped = 0;
	for (const found of text.matchAll(linkPattern)) {
		//an <url> is Discord's way of saying "no preview", so the member already said what they want
		if (found[1] === '<' && text[found.index + found[0].length] === '>') continue;
		embeddable++;
		const fixed = fixLink(found[2].replace(trailingPunctuation, ''));
		if (!fixed) continue;
		//someone already pasted the fix alongside the original, so the message has a working preview
		//that suppressing would take away
		if (text.includes(fixed)) continue;
		//the same post twice: answered once, but both links are covered
		if (posted.has(fixed)) {
			rewritten++;
			continue;
		}
		if (links.length >= maxLinks) {
			skipped++;
			continue;
		}
		posted.add(fixed);
		links.push(fixed);
		rewritten++;
	}
	return { links, allFixed: embeddable > 0 && rewritten === embeddable, skipped };
}

//when each channel's recent fixes happened, pruned as it is read. not kept across restarts: a
//restart clearing it is no worse than the first few messages after one
const recentFixes = new Map<string, number[]>();
function withinCooldown(channelId: string): boolean {
	const now = Date.now();
	const recent = (recentFixes.get(channelId) ?? []).filter((at) => now - at < cooldownWindow);
	if (recent.length >= maxFixesPerChannel) {
		recentFixes.set(channelId, recent);
		return false;
	}
	recent.push(now);
	recentFixes.set(channelId, recent);
	//a channel that has gone quiet is forgotten, so a bot in many servers doesn't keep a row per
	//channel it has ever seen
	if (recentFixes.size > maxRememberedChannels) {
		for (const [id, times] of recentFixes) {
			if (now - times[times.length - 1] >= cooldownWindow) recentFixes.delete(id);
		}
	}
	return true;
}

//called for every message, not awaited: a keyword in the same message must not wait on this, and
//everything in here is caught below.
//logging stays at warn and debug on purpose. commandError posts to the error channel, and a feature
//that runs on every message would flood it the moment it started failing systematically
export async function fixEmbeds(bot: Bot, message: Message): Promise<void> {
	try {
		//Mirror's own replies come back through here, as does every other bot's and every webhook's
		if (message.author.bot || message.webhookId) return;
		if (!message.inGuild()) return;
		if (!handledHere(bot, message.guildId)) return;
		if (!embedFixOn(message.guildId)) return;
		//a join, pin or boost notice has no member-written link in it
		if (message.system) return;
		//the same people who can't use intros, birthdays or music don't get answered here either.
		//an uncached member can't be checked, and isn't worth a fetch on every message
		if (message.member && silenceCheck(message.member)) return;

		const { links, allFixed, skipped } = fixableLinks(message.content);
		if (!links.length) return;
		if (skipped)
			bot.logger.debug(
				`Answering ${links.length} of ${links.length + skipped} fixable links in ${message.channelId}`
			);
		if (!withinCooldown(message.channelId)) {
			bot.logger.debug(
				`Not fixing links in ${message.channelId}: ${maxFixesPerChannel} already fixed there recently`
			);
			return;
		}
		//a reply Mirror can't post, or that posts as bare text because it may not embed, is worse
		//than leaving the link alone
		if (!(await bot.msgPermsCheck(message, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]))) {
			bot.logger.debug(`Cannot fix links in ${message.channelId}: Mirror may not send or embed there`);
			return;
		}

		await message.reply({
			content: links.join('\n'),
			//repliedUser: false is the one that matters. a reply pings the person it answers unless
			//it is turned off, so without this every fix would ping whoever posted the link
			allowedMentions: { parse: [], repliedUser: false },
			//the message can be gone by the time this lands, and the reply failing would only be
			//noise in the log
			failIfNotExists: false,
		});

		//the reply goes out first, so a failure to hide the empty embed never costs the fix.
		//suppressing is all or nothing, so a message with any other link in it keeps its embeds
		if (!allFixed) return;
		if (!(await bot.msgPermsCheck(message, [PermissionFlagsBits.ManageMessages]))) return;
		//Discord writes its own embed onto the message after delivering it, so there is nothing to
		//suppress yet. Mirror never deletes anything here, it only hides the embed
		const timer = setTimeout(() => {
			message
				.suppressEmbeds(true)
				.catch((err) =>
					bot.logger.debug(
						`Could not hide the embeds on a fixed message: ${err instanceof Error ? err.message : err}`
					)
				);
		}, suppressDelay);
		timer.unref();
	} catch (err) {
		bot.logger.warn(`Could not fix a link in ${message.channelId}: ${err instanceof Error ? err.message : err}`);
	}
}
