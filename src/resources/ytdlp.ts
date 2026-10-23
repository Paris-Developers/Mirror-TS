//yt-dlp, the program Mirror gets most YouTube audio from: finding it, running it for a song, stopping
//it again, and keeping it up to date. it comes with youtube-dl-exec, which downloads it once, when
//Mirror is installed
import { ChildProcess, spawn } from 'child_process';
import { existsSync } from 'fs';
import { PassThrough, Readable } from 'stream';
import { Bot } from '../Bot';
import { configText } from './config';

//yt-dlp usually starts sending audio within a few seconds; waiting longer than this means it's stuck
const firstAudioTimeout = 30 * 1000;

//how much of what yt-dlp prints is kept to explain a failure: the end, where the reason is
const keptOutput = 4000;

//youtube-dl-exec is optional (it needs Python to install), so yt-dlp may not be there
export function ytdlpPath(): string | undefined {
	try {
		const path: string = require('youtube-dl-exec').constants.YOUTUBE_DL_PATH;
		return existsSync(path) ? path : undefined;
	} catch {
		return undefined;
	}
}

//every yt-dlp Mirror runs is started here. yt-dlp reads extra options from files in several folders
//(next to yt-dlp.exe, in the user's AppData and home folders, and more) and loads plugins, Python
//code, from more folders still, so whoever could write to one of those could change what yt-dlp
//does, have it print the cookies, or run their own code as Mirror. Mirror uses neither, so both are
//switched off: --ignore-config for the option files, YTDLP_NO_PLUGINS for the plugins
function spawnYtdlp(path: string, args: string[]) {
	return spawn(path, ['--ignore-config', ...args], {
		stdio: ['ignore', 'pipe', 'pipe'],
		windowsHide: true,
		env: { ...process.env, YTDLP_NO_PLUGINS: '1' },
	});
}

//the Deno that deno_path in config.json names, if it's really there
function denoPath(): string | undefined {
	const path = configText('deno_path');
	return path && existsSync(path) ? path : undefined;
}

//YouTube only sends audio once yt-dlp has solved a challenge, a piece of JavaScript from YouTube's
//player, which yt-dlp runs in a separate JavaScript program. by default that's the Node running
//Mirror, started with Node's permission flag: that keeps the code away from files and other
//programs, but it can still use the network and read Mirror's environment. a Deno named by
//deno_path is used instead when it's there: yt-dlp gives Deno no permissions at all, so the code
//gets no network, files, environment or programs. yt-dlp needs Deno 2.3.0 or newer, and it prefers
//a Deno it finds on the PATH over Node by itself, too
export function jsRuntimeArgs(): string[] {
	const deno = denoPath();
	return ['--js-runtimes', deno ? `deno:${deno}` : `node:${process.execPath}`];
}

//starts yt-dlp and resolves once audio arrives, or rejects with yt-dlp's own error if it exits first.
//once audio is flowing, a yt-dlp that fails partway through just ends the stream early, which the
//player treats like a song that finished, so onFailure is the only place that hears about it
export function startYtdlp(
	path: string,
	args: string[],
	onFailure: (reason: string) => void
): Promise<Readable> {
	return new Promise((resolve, reject) => {
		const child = spawnYtdlp(path, args);
		const audio = new PassThrough({ highWaterMark: 1024 * 1024 });
		let output = '';
		let started = false;
		//set once Mirror is the one ending yt-dlp, so that ending isn't reported as a failure
		let stopping = false;
		const stop = () => {
			if (stopping) return;
			stopping = true;
			stopYtdlp(child);
		};

		const giveUp = (error: Error) => {
			if (started) return;
			clearTimeout(timer);
			stop();
			audio.destroy();
			reject(error);
		};
		const timer = setTimeout(
			() => giveUp(new Error(`no audio after ${firstAudioTimeout / 1000} seconds`)),
			firstAudioTimeout
		);

		child.stderr.on('data', (chunk) => (output = (output + chunk).slice(-keptOutput)));
		child.stdout.once('data', () => {
			started = true;
			clearTimeout(timer);
			resolve(audio);
		});
		child.stdout.pipe(audio);
		//yt-dlp that can't be started at all (missing, or mid-update); later trouble shows up on close
		child.on('error', giveUp);
		child.on('close', (code) => {
			if (!started) return giveUp(new Error(ytdlpReason(output, code)));
			if (!stopping && code !== 0) onFailure(ytdlpReason(output, code));
		});
		//when the song ends, or is dropped partway (a skip, a stop, Mirror leaving), yt-dlp stops too.
		//youtubeStream makes sure a dropped song's stream is closed; the player never does
		audio.on('close', stop);
	});
}

//closing yt-dlp's output makes its next write fail, and it then exits by itself. that matters on
//Windows, where yt-dlp.exe is a small launcher that unpacks the real program (about 24 MB) into the
//temp folder and runs it as a second process: killing the launcher leaves that second process
//running, and only a clean exit removes what it unpacked. a yt-dlp that isn't writing (stuck, or
//still starting up) is killed after a few seconds, along with everything it started
function stopYtdlp(child: ChildProcess, grace = 5000) {
	child.stdout?.destroy();
	const force = setTimeout(() => {
		if (child.exitCode !== null || child.signalCode !== null) return;
		if (process.platform === 'win32' && child.pid) {
			spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }).on(
				'error',
				() => child.kill()
			);
		} else {
			child.kill('SIGKILL');
		}
	}, grace);
	force.unref();
	child.once('exit', () => clearTimeout(force));
}

//a line of the cookie file that yt-dlp can't read is repeated word for word, cookie values and all:
//"skipping cookie file entry due to ...: '<the line>'" as a warning, or "invalid Netscape format
//cookies file '<file>': '<the line>'" from Python's own cookie reader, as the error and again in a
//traceback. the reason ends up in the log and the error channel, so lines like these are left out,
//and so is any line with a cookie entry's tab separated TRUE/FALSE columns in it, whatever it says
const cookieLine = /cookie file entry|invalid Netscape format cookies file|(\t|\\t)(TRUE|FALSE)(\t|\\t)/i;

//why yt-dlp failed: its last "ERROR: [youtube] id: reason" line, as just the reason. the warnings
//before it usually say what went wrong underneath (only images were offered, a missing PO token, a
//failed n challenge), so the last two come along. yt-dlp's own usage errors have no ERROR: prefix,
//so without one the exit code and the last line it printed are used
function ytdlpReason(output: string, code: number | null): string {
	const printed = output.split(/\r?\n/);
	//once the start was cut off, the first line kept may be the end of a longer one, which then
	//can't be recognised as a cookie line or anything else
	if (output.length >= keptOutput) printed.shift();
	const all = printed.map((line) => line.trim()).filter(Boolean);
	const lines = all.filter((line) => !cookieLine.test(line));
	const leftOut = lines.length < all.length;
	const strip = (line: string) => line.replace(/^(ERROR|WARNING):\s*(\[[^\]]+\]\s*[\w-]+:\s*)?/, '').trim();
	const error = lines.findLast((line) => line.startsWith('ERROR:'));
	const warnings = [...new Set(lines.filter((line) => line.startsWith('WARNING:')).map(strip))].slice(-2);
	const reason = error
		? strip(error)
		: leftOut
			? 'yt-dlp could not read the cookie file'
			: `yt-dlp exited with code ${code}${lines.length ? ` after printing "${lines.at(-1)}"` : ''}`;
	if (error && leftOut) warnings.unshift('yt-dlp skipped lines of the cookie file it could not read');
	return warnings.length ? `${reason} (${warnings.join('; ')})` : reason;
}

//runs yt-dlp for a quick job, such as printing its version or updating itself, and returns what it printed
function runYtdlp(path: string, args: string[], timeout: number): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = spawnYtdlp(path, args);
		let printed = '';
		let errors = '';
		child.stdout.on('data', (chunk) => (printed += chunk));
		child.stderr.on('data', (chunk) => (errors = (errors + chunk).slice(-keptOutput)));
		const timer = setTimeout(() => {
			stopYtdlp(child, 0);
			reject(new Error(`gave up after ${timeout / 1000} seconds`));
		}, timeout);
		child.on('error', (error) => {
			clearTimeout(timer);
			reject(error);
		});
		child.on('close', (code) => {
			clearTimeout(timer);
			if (code === 0) resolve(printed.trim());
			else reject(new Error(ytdlpReason(errors, code)));
		});
	});
}

const version = (path: string) => runYtdlp(path, ['--version'], 60 * 1000);
const describe = (error: unknown) => (error instanceof Error ? error.message : String(error));

//nothing else updates yt-dlp after it's installed (the youtube extractor says it does, but its update
//job is empty), and YouTube changes often enough to break an old one. a new release is usually the
//fix, so Mirror updates it itself, daily. the first check waits a while after startup, so a bot that
//keeps crashing and restarting doesn't ask GitHub for the latest version every few seconds.
//a missing yt-dlp is only reported, not downloaded: it comes back by reinstalling youtube-dl-exec
export function keepYtdlpUpdated(bot: Bot): void {
	const path = ytdlpPath();
	if (!path) {
		bot.logger.warn(
			'yt-dlp is not installed, so YouTube songs only use the slower fallback download method. ' +
				'It comes with youtube-dl-exec: run npm ci again (on Windows without Python, first run ' +
				'$env:YOUTUBE_DL_SKIP_PYTHON_CHECK = "1" in PowerShell; the Windows yt-dlp does not need Python)'
		);
		return;
	}
	version(path).then(
		(current) => bot.logger.info(`Using yt-dlp ${current}`),
		(error) => bot.logger.warn(`yt-dlp is installed but would not run: ${describe(error)}`)
	);
	//a deno_path that's wrong would otherwise go unnoticed, with Node quietly used instead
	const deno = configText('deno_path');
	if (!deno) {
		bot.logger.info(`yt-dlp will run YouTube's challenge code in Node, unless it finds Deno on the PATH`);
	} else if (denoPath()) {
		bot.logger.info(`yt-dlp will run YouTube's challenge code in Deno (${deno}), which must be 2.3.0 or newer`);
	} else {
		bot.logger.warn(
			`deno_path in config.json is "${deno}", but there's no file there, so yt-dlp will run ` +
				`YouTube's challenge code in Node instead`
		);
	}

	const update = async () => {
		const before = await version(path).catch(() => 'an unknown version');
		try {
			//on Windows the running yt-dlp.exe is renamed out of the way, so songs playing now carry on
			await runYtdlp(path, ['-U'], 3 * 60 * 1000);
		} catch (error) {
			bot.logger.warn(`Could not update yt-dlp (${before}), will try again tomorrow: ${describe(error)}`);
			return;
		}
		const after = await version(path).catch(() => before);
		if (after !== before) bot.logger.info(`Updated yt-dlp from ${before} to ${after}`);
		else bot.logger.debug(`yt-dlp ${after} is up to date`);
	};
	setTimeout(() => {
		update();
		setInterval(update, 24 * 60 * 60 * 1000).unref();
	}, 10 * 60 * 1000).unref();
}
