//which links Mirror rewrites so they embed in Discord, and what it rewrites them to. data only:
//the matching and posting live in embedFix.ts.
//
//the three sites here either refuse Discord's crawler or hand it a picture of nothing, so a member's
//link shows up as a bare url or a blank card. the fixers are small third-party sites that serve the
//crawler the preview the real site won't, keeping the link pointed at the same post.
//
//every host here is written out by hand. an upstream project's alias list is not a safe source for
//it: the aliases people pass around have been dying and changing hands. ddinstagram.com is dead,
//vxtiktok.com was taken down by legal request, vxtwitter.com no longer serves crawlers at all, and
//instagramez.com now redirects to an ad network. a generated list would quietly start pointing
//members at whoever bought the domain next, so this one is an explicit allowlist and is checked by
//hand before anything is added to it.

export type FixerPattern = {
	//anchored pattern for the url's path. $1, $2... in the template are its capture groups
	match: RegExp;
	template: string;
};

export type FixerRule = {
	//short name, used when a malformed rule has to be dropped
	id: string;
	//set false to park a rule without deleting it, for when a fixer goes down
	enabled: boolean;
	//exact hosts, compared after www. / m. / mobile. is stripped off the front. never a suffix match
	hosts: string[];
	//paths this rule leaves alone even when one of its patterns would match
	skipPaths?: RegExp[];
	patterns: FixerPattern[];
};

//all of these were checked against Discord's crawler by hand. if one stops working, swapping the
//host in the templates below is the whole change:
//  X         -> fixupx.com      (the same operator as fxtwitter, so it's a cosmetic swap)
//  TikTok    -> tfxktok.com, then dxtiktok.com (independent operators)
//  Instagram -> kirkstagram.com (tolerant of odd paths, but sometimes loses the author's name)
const rules: FixerRule[] = [
	{
		id: 'x',
		enabled: true,
		hosts: ['x.com', 'twitter.com'],
		patterns: [
			//a post, optionally pointing at one of its pictures or videos. the handle is cosmetic --
			//fxtwitter looks the post up by its id alone -- so /i/status/<id> comes through as the
			//handle "i" and still works
			{
				match: /^\/([A-Za-z0-9_]{1,15})\/status\/(\d{1,20})(?:\/(?:photo|video)\/\d{1,4})?\/?$/,
				template: 'https://fxtwitter.com/$1/status/$2',
			},
			//the older /i/web/status form, which has no handle in it at all
			{ match: /^\/i\/web\/status\/(\d{1,20})\/?$/, template: 'https://fxtwitter.com/i/status/$1' },
		],
	},
	{
		id: 'tiktok',
		enabled: true,
		hosts: ['tiktok.com'],
		patterns: [
			//a photo post embeds from the video route, so both go to /video/
			{
				match: /^\/@([A-Za-z0-9_.]{1,30})\/(?:video|photo)\/(\d{1,30})\/?$/,
				template: 'https://www.tnktok.com/@$1/video/$2',
			},
			//tiktok's own short route. only tnktok serves these, which is why it is the fixer here
			{ match: /^\/t\/([A-Za-z0-9]{1,30})\/?$/, template: 'https://vm.tnktok.com/$1' },
		],
	},
	{
		id: 'tiktok-short',
		enabled: true,
		//kept apart from the rule above: on tiktok.com a single path segment is a page like /explore
		//or /login, and only on these hosts is it a post's code
		hosts: ['vm.tiktok.com', 'vt.tiktok.com'],
		patterns: [{ match: /^\/([A-Za-z0-9]{1,30})\/?$/, template: 'https://vm.tnktok.com/$1' }],
	},
	{
		id: 'instagram',
		enabled: true,
		hosts: ['instagram.com'],
		//instagram's /share/... links are an id for the share itself, not for the post, and no fixer
		//resolves them. finding the post behind one would mean following the redirect, and Mirror
		//never fetches a member's link, so these are left as they are
		skipPaths: [/^\/share(?:\/|$)/],
		patterns: [
			//the username in front is instagram's current share format, so it is the common case, and
			//the fixer wants the post's own path without it
			{
				match: /^(?:\/[A-Za-z0-9_.]{1,30})?\/p\/([A-Za-z0-9_-]{1,64})\/?$/,
				template: 'https://67instagram.com/p/$1',
			},
			//reels and the old tv route are all the same thing to the fixer
			{
				match: /^(?:\/[A-Za-z0-9_.]{1,30})?\/(?:reel|reels|tv)\/([A-Za-z0-9_-]{1,64})\/?$/,
				template: 'https://67instagram.com/reel/$1',
			},
		],
	},
];

//hosts Mirror never rewrites, so it can't fix a link that is already fixed: its own replies, another
//bot's, and a member who pasted a fixer link themselves. the fixers each run several of these
export const fixerHosts: string[] = [
	'fxtwitter.com',
	'fixupx.com',
	'twittpr.com',
	'girlcockx.com',
	'vxtwitter.com',
	'fixvx.com',
	'67instagram.com',
	'kkinstagram.com',
	'kirkstagram.com',
	'instagramfix.com',
	'eeinstagram.com',
	'ddinstagram.com',
	'instagramez.com',
	'vxinstagram.com',
	'instagram7.com',
	'tnktok.com',
	'dxtiktok.com',
	'tfxktok.com',
	'kktiktok.com',
	'tiktokez.com',
	'vxtiktok.com',
	'cocktiktok.com',
];

//why a rule was dropped, if any were. kept so it can be checked, and said once below
export const ruleProblems: string[] = [];

//a rule with a typo in it would otherwise throw on the first message that reached it, in a feature
//that runs on every message, so the broken one is dropped here and the rest of the feature carries on
export function validateRules(candidates: FixerRule[]): FixerRule[] {
	const kept: FixerRule[] = [];
	for (const rule of candidates) {
		//checking a rule must not be able to take the feature down either
		let problem: string | undefined;
		try {
			problem = ruleProblem(rule);
		} catch (err) {
			problem = `checking it failed: ${err instanceof Error ? err.message : String(err)}`;
		}
		if (problem) {
			ruleProblems.push(`Dropped the ${rule?.id ?? 'unnamed'} link fixer rule: ${problem}`);
			continue;
		}
		kept.push(rule);
	}
	return kept;
}

function ruleProblem(rule: FixerRule): string | undefined {
	if (!rule || typeof rule.id !== 'string' || !rule.id) return 'it has no name';
	if (typeof rule.enabled !== 'boolean') return 'enabled is not true or false';
	if (!Array.isArray(rule.hosts) || !rule.hosts.length) return 'it lists no hosts';
	//a host with a slash or a leading dot in it would never match a parsed url's hostname, so the
	//rule would silently do nothing
	for (const host of rule.hosts) {
		if (typeof host !== 'string' || !/^[a-z0-9.-]+$/.test(host) || host.startsWith('.'))
			return `${String(host)} is not a plain lowercase host`;
	}
	if (rule.skipPaths && !Array.isArray(rule.skipPaths)) return 'skipPaths is not a list';
	for (const skip of rule.skipPaths ?? []) {
		if (!(skip instanceof RegExp)) return 'a skipPaths entry is not a pattern';
	}
	if (!Array.isArray(rule.patterns) || !rule.patterns.length) return 'it has no patterns';
	for (const pattern of rule.patterns) {
		if (!pattern || !(pattern.match instanceof RegExp)) return 'a pattern has no regular expression';
		//an unanchored pattern would match a path that merely contains a post's shape, and the global
		//flag would carry a lastIndex between messages
		if (!pattern.match.source.startsWith('^') || !pattern.match.source.endsWith('$'))
			return `the pattern ${pattern.match.source} is not anchored at both ends`;
		if (pattern.match.global) return `the pattern ${pattern.match.source} has the global flag`;
		if (typeof pattern.template !== 'string' || !pattern.template.startsWith('https://'))
			return 'a template is not an https url';
		//every $n in the template has to have a group behind it, or the fix would come out with a
		//hole where the post's id should be
		const groups = new RegExp(`${pattern.match.source}|`).exec('')!.length - 1;
		for (const reference of pattern.template.match(/\$\d/g) ?? []) {
			if (Number(reference.slice(1)) > groups)
				return `${pattern.template} uses ${reference} but the pattern has ${groups} group(s)`;
		}
	}
	return undefined;
}

export const fixerRules: FixerRule[] = validateRules(rules);

//this runs while the file is first loaded, before the bot and its logger exist, so there is nothing
//else to say it with. a dropped rule means the rest of the feature still works and one site stopped
//being fixed, which is quiet enough to be worth printing loudly
for (const problem of ruleProblems) console.warn(problem);
