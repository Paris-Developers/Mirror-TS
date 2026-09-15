// One-time migration of Mirror's saved data (data/enmap.sqlite) from enmap 5 to enmap 6.
//
// enmap 5 lowercased table names and stored values with serialize-javascript; enmap 6 looks tables up
// by their exact name and stores values with better-serialize, so it crashes on a v5 database.
// This reads every v5 table directly and rewrites the values through enmap 6.
//
// Stop the bot, then run from the project folder:
//   node scripts/migrate-enmap-v5.js
// The old database is kept as data/enmap.v5.sqlite.
const fs = require('fs');
const path = require('path');

// enmap reads ./package.json as it loads and keeps its data in ./data, so this has to run from the project folder
if (!fs.existsSync('package.json')) {
	console.error('Run this from the Mirror-TS project folder: node scripts/migrate-enmap-v5.js');
	process.exit(1);
}
const Database = require('better-sqlite3');
const Enmap = require('enmap').default;

// enmap names exactly as the bot creates them (enmap 6 table names are case-sensitive)
const NAMES = [
	'bdayChannels',
	'bdayDates',
	'bdayTimes',
	'defaultVc',
	'gav_records',
	'managerRoles',
	'nsfw',
	'nuts',
	'serverColors',
	'SilencedRole',
	'silencedUsers',
	'songs',
	'updateChannels',
];
// each enmap adds a process 'exit' listener
process.setMaxListeners(NAMES.length + 10);

// enmap resolves its data folder from the working directory, so this must too
const dataDir = path.resolve('data');
const current = path.join(dataDir, 'enmap.sqlite');
const backup = path.join(dataDir, 'enmap.v5.sqlite');
console.log(`Database: ${current}`);

if (!fs.existsSync(current)) {
	console.log('No enmap.sqlite found, nothing to migrate.');
	process.exit(0);
}

// enmap 5 keeps an internal::changes::<name> table for every enmap; enmap 6 doesn't
const v5 = new Database(current);
const tables = v5
	.prepare("SELECT name FROM sqlite_master WHERE type='table'")
	.all()
	.map((t) => t.name);
if (!tables.some((t) => t.startsWith('internal::changes::'))) {
	v5.close();
	console.log('This is not an enmap 5 database, nothing to migrate.');
	process.exit(0);
}
if (fs.existsSync(backup)) {
	v5.close();
	console.error('enmap.v5.sqlite already exists, refusing to overwrite the backup. Move it away first.');
	process.exit(1);
}

// fold any write-ahead log into the main file, then move the v5 database aside
v5.pragma('wal_checkpoint(TRUNCATE)');
v5.close();
fs.renameSync(current, backup);
for (const side of ['-wal', '-shm']) {
	if (fs.existsSync(current + side)) fs.rmSync(current + side);
}

const old = new Database(backup, { readonly: true });
let total = 0;
for (const name of NAMES) {
	const table = name.toLowerCase();
	if (!tables.includes(table)) continue;
	const rows = old.prepare(`SELECT key, value FROM "${table}"`).all();
	const enmap = new Enmap({ name });
	for (const { key, value } of rows) {
		// enmap 5 wrote serialize-javascript output and read it back by evaluating it; do the same
		enmap.set(key, new Function(`return (${value});`)());
	}
	console.log(`  ${name}: ${rows.length} entries`);
	total += rows.length;
}

const known = new Set(NAMES.map((n) => n.toLowerCase()));
for (const table of tables) {
	if (!table.startsWith('internal::') && !known.has(table)) {
		console.warn(`  skipped unknown table "${table}" (still in the backup)`);
	}
}
old.close();
console.log(`Migrated ${total} entries. The old database is kept as data/enmap.v5.sqlite.`);
