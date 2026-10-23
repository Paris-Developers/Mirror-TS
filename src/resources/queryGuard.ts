import { isIP } from 'net';

//the most a search can be. far more than any song name or link needs. /play, /playnext and /intro
//also tell Discord, so it stops anyone typing more
export const MAX_QUERY_LENGTH = 500;

//names that are looked up on the host's own network rather than the internet
const localEndings = ['.localhost', '.local', '.lan', '.internal', '.home', '.home.arpa', '.localdomain'];

//Mirror looks up whatever people type into /play, /playnext and /intro, and the music library does
//a few things with that text before Mirror's own checks in extractors.ts get a say:
//- it follows anything that looks like a spotify.link short link, and its pattern for those is so
//  loose that made up names like spotify-link match it. Windows then looks for a computer by that
//  name on the host's own network
//- when the same text comes in again it hands back what it found last time, and that includes the
//  intro and sound effect files Mirror plays from its own disk
//- some of its link patterns take over a second to check against a very long link, and nothing
//  else in Mirror can happen while they run
//so text like that is turned away first. returns the reason, written for the person who typed it,
//or nothing when the text is fine to search for
export function queryProblem(query: string): string | undefined {
	//counted by character, so an emoji counts as one
	if ([...query].length > MAX_QUERY_LENGTH)
		return `That's too long to search for. Keep it to ${MAX_QUERY_LENGTH} characters or fewer.`;
	const text = query.trim();
	if (looksLikeFile(text))
		return "Mirror can't play files from the computer it runs on. Paste a link, or type a song name to search for.";
	const link = asLink(text);
	if (link !== undefined) return linkProblem(link);
}

//C:\ or C:/, \\server\share and //server/share, paths starting with / \ ~/ or ~name/, and file: links
function looksLikeFile(text: string): boolean {
	return /^[a-z]:[\\/]/i.test(text) || /^[\\/]/.test(text) || /^~[^\s\\/]*[\\/]/.test(text) || /^file:/i.test(text);
}

//the text as a link, when the library would read it as one: anything with :// in it, and http: or
//https: without the slashes, which the library's link reader fills in by itself. an address on the
//local network with no http in front (localhost:8080, 192.168.1.1/admin) counts too, so it gets a
//clear answer instead of a YouTube search for it
function asLink(text: string): string | undefined {
	if (text.includes('://') || /^https?:/i.test(text)) return text;
	if (/\s/.test(text)) return undefined;
	if (
		/^localhost[:/]/i.test(text) ||
		/^(\d{1,3}\.){3}\d{1,3}([:/?#]|$)/.test(text) ||
		/^\[[0-9a-f.]*:[0-9a-f:.]*\]/i.test(text)
	)
		return `http://${text}`;
}

function linkProblem(link: string): string | undefined {
	let url: URL;
	try {
		url = new URL(link);
	} catch {
		return "That link doesn't look right. Paste just the link, or type a song name to search for.";
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:')
		return 'Mirror can only play web links, the kind starting with https://';
	//the site the link really goes to. in spotify@link the site is "link", whatever comes before the @
	if (!publicHost(url.hostname))
		return 'Mirror only plays links to public websites, like YouTube, Spotify or SoundCloud.';
	//a name or password in front of the site (user@site) is never needed for music, and is only ever
	//there to disguise which site a link goes to
	if (url.username || url.password) return "Mirror won't play links with a name or password in them.";
}

//a dotted name on the internet, like youtube.com. a name with no dot in it, or one of the endings
//above, is looked up on the host's own network, and an IP address could be anything, the host
//included. the link reader has already turned every way of writing an IP address into the plain one
function publicHost(hostname: string): boolean {
	const name = hostname.replace(/\.+$/, '');
	const labels = name.split('.');
	if (labels.length < 2 || labels.some((label) => !label)) return false;
	if (name.startsWith('[') || isIP(name)) return false;
	return !localEndings.some((ending) => name === ending.slice(1) || name.endsWith(ending));
}
