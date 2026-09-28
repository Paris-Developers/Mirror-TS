//checks, before Mirror logs in, that the pieces voice needs really load. discord-voip (the voice
//library inside discord-player) hides a missing piece when it starts and only fails when the piece
//is used: without the DAVE library every voice join crashes the bot, and without an xchacha20
//library the first sound in a voice server that picks that encryption crashes it. so each piece
//gets one line in the log here, and a missing one gets a loud one. never throws, and is quick
import { createRequire } from 'module';
import { getCiphers } from 'crypto';
import { FFmpeg, version as playerVersion } from 'discord-player';
import { version as voipVersion } from 'discord-voip';
import { Bot } from '../Bot';

//discord-voip loads these from its own folder, so they are looked up from there too
const voipRequire = createRequire(require.resolve('discord-voip'));

//the DAVE library does the end-to-end encryption Discord requires in voice channels
function checkDave(bot: Bot): void {
	try {
		const davey = voipRequire('@snazzah/davey') as { DAVE_PROTOCOL_VERSION?: number; VERSION?: string };
		if (!davey.DAVE_PROTOCOL_VERSION) throw new Error('it reports no DAVE protocol version');
		bot.logger.info(
			`Voice: DAVE ready (@snazzah/davey ${davey.VERSION}, protocol version ${davey.DAVE_PROTOCOL_VERSION})`
		);
	} catch (error) {
		bot.logger.error(
			'Voice: the DAVE library (@snazzah/davey) does not load, so every voice join will crash Mirror. Reinstall with npm ci, without leaving out optional packages',
			error
		);
	}
}

//the same libraries, in the same order, that discord-voip tries for xchacha20 encryption. it takes
//the first that imports, so the first that imports here is the one it uses
const xchachaLibraries = [
	'sodium-native',
	'sodium',
	'libsodium-wrappers',
	'@stablelib/xchacha20poly1305',
	'@noble/ciphers/chacha',
	'sodium-javascript',
];

//voice servers offer aes-256-gcm, which node has built in, and xchacha20, which needs a library.
//the server's own order decides which one is used, so both have to work
async function checkEncryption(bot: Bot): Promise<void> {
	const aes = getCiphers().includes('aes-256-gcm');
	for (const name of xchachaLibraries) {
		try {
			const lib = await import(name);
			if (name === 'libsodium-wrappers' && lib.ready) await lib.ready;
			if (aes) bot.logger.info(`Voice: encryption ready (aes-256-gcm from node, xchacha20 from ${name})`);
			else bot.logger.warn(`Voice: only xchacha20 encryption (from ${name}); this node has no aes-256-gcm`);
			return;
		} catch {
			//not installed, or does not load; discord-voip moves on to the next one the same way
		}
	}
	if (aes) {
		bot.logger.error(
			`Voice: no xchacha20 encryption library loads (tried ${xchachaLibraries.join(', ')}). Sound plays while voice servers pick aes-256-gcm, but Mirror crashes on the first sound in a voice server that picks xchacha20. Run npm ci to install @noble/ciphers`
		);
	} else {
		bot.logger.error(
			'Voice: no voice encryption works (no aes-256-gcm in node and no xchacha20 library), so every sound will crash Mirror. Run npm ci'
		);
	}
}

//turns the decoded sound into opus, the format Discord's voice servers take
function checkOpus(bot: Bot): void {
	try {
		const { OpusEncoder } = voipRequire('@discord-player/opus') as {
			OpusEncoder: { new (options: object): { destroy(): void }; readonly type?: string };
		};
		//making one loads the native encoder, which is what fails on a broken install
		new OpusEncoder({ rate: 48000, channels: 2, frameSize: 960 }).destroy();
		bot.logger.info(`Voice: opus encoder ready (${OpusEncoder.type})`);
	} catch (error) {
		bot.logger.error(
			'Voice: no opus encoder loads, so no music or sound can play. Reinstall with npm ci, without leaving out optional packages',
			error
		);
	}
}

//ffmpeg decodes every song and sound. discord-player looks for one on the PATH before the copy that
//comes with Mirror (ffmpeg-static), while intros are recorded with ffmpeg-static, so an old ffmpeg
//installed elsewhere on the machine would quietly play everything. putting ffmpeg-static first makes
//playback use the copy every machine gets from npm. if that copy failed to download, discord-player
//still carries on down its list to the PATH as before
function checkFFmpeg(bot: Bot): void {
	const bundled = FFmpeg.sources.findIndex((source) => source.name === 'ffmpeg-static');
	if (bundled > 0) FFmpeg.sources.unshift(...FFmpeg.sources.splice(bundled, 1));
	//force a fresh search, in case something looked ffmpeg up before the order changed
	const ffmpeg = FFmpeg.resolveSafe(true);
	if (!ffmpeg) {
		bot.logger.error('Voice: no ffmpeg found, so no music or sound can play. Reinstall with npm ci');
	} else if (ffmpeg.name !== 'ffmpeg-static') {
		const where = ffmpeg.module ? ffmpeg.name : `the command ${ffmpeg.path}`;
		bot.logger.warn(
			`Voice: ffmpeg ${ffmpeg.version} from ${where}, because the copy that comes with Mirror (ffmpeg-static) did not run. Reinstall with npm ci`
		);
	} else {
		bot.logger.info(`Voice: ffmpeg ${ffmpeg.version} from ffmpeg-static (${ffmpeg.path})`);
	}
}

//Mirror waits on voice connections with discord-voip's own helpers, which have to be the same copy
//discord-player uses
function checkVersions(bot: Bot): void {
	const ours = require.resolve('discord-voip');
	const players = createRequire(require.resolve('discord-player')).resolve('discord-voip');
	if (ours === players) {
		bot.logger.info(`Voice: discord-player ${playerVersion} with discord-voip ${voipVersion}`);
	} else {
		bot.logger.warn(
			`Voice: discord-player ${playerVersion} has its own copy of discord-voip (${players}) apart from Mirror's ${voipVersion}. Keep package.json's discord-voip in step with discord-player's`
		);
	}
}

export async function checkVoiceDependencies(bot: Bot): Promise<void> {
	for (const check of [checkVersions, checkDave, checkEncryption, checkOpus, checkFFmpeg]) {
		try {
			await check(bot);
		} catch (error) {
			bot.logger.error('Voice: a startup check went wrong', error);
		}
	}
}
