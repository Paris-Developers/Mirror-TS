// Rewrites saved intro themes so they can be played.
//
// Playback streams each file through a pipe into ffmpeg. An mp4 keeps its index at the end of the
// file unless told otherwise, and a pipe cannot seek back to read it, so those intros play as
// silence. Copying each file with faststart moves the index to the front. The audio itself is
// copied, not re-encoded, so nothing is lost and the files stay the same size.
//
// Stop the bot, then run from the project folder:
//   node scripts/faststart-intros.js
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

if (!fs.existsSync('package.json')) {
	console.error('Run this from the Mirror-TS project folder: node scripts/faststart-intros.js');
	process.exit(1);
}
const ffmpeg = require('ffmpeg-static');

const root = path.resolve('data/intros');
if (!fs.existsSync(root)) {
	console.log('No data/intros folder, nothing to convert.');
	process.exit(0);
}

const files = [];
for (const guild of fs.readdirSync(root)) {
	const dir = path.join(root, guild);
	if (!fs.statSync(dir).isDirectory()) continue;
	for (const name of fs.readdirSync(dir)) {
		if (name.endsWith('.mp4')) files.push(path.join(dir, name));
	}
}
console.log(`Found ${files.length} intro files in ${root}`);

let converted = 0;
let failed = 0;
for (const file of files) {
	//keep the .mp4 on the end: ffmpeg picks the output format from the extension
	const temp = `${file}.faststart.mp4`;
	const run = spawnSync(
		ffmpeg,
		['-y', '-v', 'error', '-i', file, '-c', 'copy', '-movflags', '+faststart', temp],
		{ encoding: 'utf8' }
	);
	if (run.status !== 0 || !fs.existsSync(temp)) {
		failed++;
		console.warn(`  failed: ${path.relative(root, file)} ${(run.stderr || '').trim().split('\n')[0]}`);
		if (fs.existsSync(temp)) fs.rmSync(temp);
		continue;
	}
	fs.renameSync(temp, file);
	converted++;
}

console.log(`Converted ${converted} file(s), ${failed} failed.`);
