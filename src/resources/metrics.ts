//optional stats about the bot itself, in the format Prometheus reads. set metrics_port in
//config.json to turn them on; they are served on 127.0.0.1 only, so nothing outside the machine
//running the bot can reach them. everything here describes Mirror's own process, so other
//programs on the same machine never show up in these numbers
import { Counter, Gauge, Registry, collectDefaultMetrics } from 'prom-client';
import { ChildProcess } from 'child_process';
import dgram from 'dgram';
import http from 'http';
import net from 'net';
import path from 'path';
import { readdir, stat } from 'fs/promises';
import type { Bot } from '../Bot';
import config from '../../config.json';

const registry = new Registry();

//these are counted from anywhere in the bot, whether or not the stats are being served
export const commandsUsed = new Counter({
	name: 'mirror_commands_total',
	help: 'Slash commands used, by command and server',
	labelNames: ['command', 'guild'],
	registers: [registry],
});
export const tracksStarted = new Counter({
	name: 'mirror_tracks_started_total',
	help: 'Songs and sounds that started playing, by server',
	labelNames: ['guild'],
	registers: [registry],
});
export const playerErrors = new Counter({
	name: 'mirror_player_errors_total',
	help: 'Errors from the music player, by kind',
	labelNames: ['kind'],
	registers: [registry],
});
export const unhandledRejections = new Counter({
	name: 'mirror_unhandled_rejections_total',
	help: 'Promise rejections nothing handled; each one is logged',
	registers: [registry],
});

//bytes on the connections Mirror opens: Discord's gateway and API, YouTube and the other web APIs
//over TCP, and voice audio over UDP. TLS connections are counted after decryption, which leaves
//out handshakes and encryption overhead, so the TCP numbers run under what goes over the wire.
//song downloads happen inside yt-dlp, a separate process, and are counted from what it hands back
let tcpClosedRead = 0;
let tcpClosedWritten = 0;
const openTcpSockets = new Set<net.Socket>();
let udpSent = 0;
let udpReceived = 0;
let udpPacketsSent = 0;
let udpPacketsReceived = 0;
let downloadClosedBytes = 0;
const openDownloads = new Set<net.Socket>();

function countNetworkTraffic() {
	//every outgoing TCP connection goes through Socket.connect, TLS ones included
	const connect = net.Socket.prototype.connect as (...args: unknown[]) => net.Socket;
	net.Socket.prototype.connect = function (this: net.Socket, ...args: unknown[]) {
		if (!openTcpSockets.has(this)) {
			openTcpSockets.add(this);
			this.once('close', () => {
				tcpClosedRead += this.bytesRead;
				tcpClosedWritten += this.bytesWritten;
				openTcpSockets.delete(this);
			});
		}
		return connect.apply(this, args);
	} as typeof net.Socket.prototype.connect;

	//UDP only carries voice audio in Mirror. a socket that isn't bound yet queues the send and
	//calls send again once it is, so only sends on a bound socket are counted
	const send = dgram.Socket.prototype.send as (...args: unknown[]) => void;
	dgram.Socket.prototype.send = function (this: dgram.Socket, ...args: unknown[]) {
		if (isBound(this)) {
			udpSent += datagramSize(args);
			udpPacketsSent++;
		}
		return send.apply(this, args);
	} as typeof dgram.Socket.prototype.send;

	const emit = dgram.Socket.prototype.emit as (...args: unknown[]) => boolean;
	dgram.Socket.prototype.emit = function (this: dgram.Socket, ...args: unknown[]) {
		if (args[0] === 'message' && Buffer.isBuffer(args[1])) {
			udpReceived += args[1].length;
			udpPacketsReceived++;
		}
		return emit.apply(this, args);
	} as typeof dgram.Socket.prototype.emit;

	//every way of starting a program (spawn, exec, execFile) goes through ChildProcess.spawn.
	//yt-dlp writes the song it downloads to its output, which the bot reads through a pipe, so the
	//bytes read from that pipe are the download. the pipe is kept at the start: once yt-dlp exits,
	//the library that starts it replaces stdout on the process object with the collected output
	const childProcess = ChildProcess.prototype as unknown as { spawn: (...args: unknown[]) => unknown };
	const spawn = childProcess.spawn;
	childProcess.spawn = function (this: ChildProcess, ...args: unknown[]) {
		const result = spawn.apply(this, args);
		const file = (args[0] as { file?: unknown } | undefined)?.file;
		const output = this.stdout;
		if (typeof file === 'string' && /^yt-dlp/i.test(path.basename(file)) && output instanceof net.Socket) {
			openDownloads.add(output);
			output.once('close', () => {
				downloadClosedBytes += output.bytesRead;
				openDownloads.delete(output);
			});
		}
		return result;
	};
}

function isBound(socket: dgram.Socket): boolean {
	try {
		socket.address();
		return true;
	} catch {
		return false;
	}
}

//send(msg, offset, length, ...) sends part of msg; every other form sends all of it
function datagramSize(args: unknown[]): number {
	const [message, offset, length] = args;
	if (typeof offset === 'number' && typeof length === 'number') return length;
	const parts = Array.isArray(message) ? message : [message];
	return parts.reduce<number>((total, part) => {
		if (typeof part === 'string') return total + Buffer.byteLength(part);
		if (ArrayBuffer.isView(part)) return total + part.byteLength;
		return total;
	}, 0);
}

//a counter only goes up, so each scrape adds whatever a running total grew by since the last one
const reported = new Map<string, number>();
function raiseTo(counter: Counter<string>, labels: Record<string, string>, total: number) {
	const key = `${(counter as unknown as { name: string }).name} ${JSON.stringify(labels)}`;
	const previous = reported.get(key);
	if (previous === undefined) counter.inc(labels, total);
	else if (total > previous) counter.inc(labels, total - previous);
	reported.set(key, Math.max(total, previous ?? 0));
}

async function folderSize(folder: string): Promise<number> {
	const entries = await readdir(folder, { recursive: true, withFileTypes: true });
	let total = 0;
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		total += (await stat(path.join(entry.parentPath, entry.name)).catch(() => null))?.size ?? 0;
	}
	return total;
}

//metrics_port is optional and absent from most config.json files, so it is read defensively
function metricsPort(): number | undefined {
	const value = Number((config as Record<string, unknown>)['metrics_port']);
	return Number.isInteger(value) && value > 0 && value < 65536 ? value : undefined;
}

//call before logging in, so the Discord connections are counted from the start
export function startMetrics(bot: Bot): void {
	const port = metricsPort();
	if (!port) return;

	countNetworkTraffic();
	collectDefaultMetrics({ register: registry, prefix: 'mirror_' });

	new Counter({
		name: 'mirror_network_bytes_total',
		help: 'Bytes Mirror has sent and received, by protocol. TCP is counted after decryption; song downloads are in mirror_song_download_bytes_total',
		labelNames: ['protocol', 'direction'],
		registers: [registry],
		collect() {
			let read = tcpClosedRead;
			let written = tcpClosedWritten;
			for (const socket of openTcpSockets) {
				read += socket.bytesRead;
				written += socket.bytesWritten;
			}
			raiseTo(this, { protocol: 'tcp', direction: 'received' }, read);
			raiseTo(this, { protocol: 'tcp', direction: 'sent' }, written);
			raiseTo(this, { protocol: 'udp', direction: 'received' }, udpReceived);
			raiseTo(this, { protocol: 'udp', direction: 'sent' }, udpSent);
		},
	});
	//each UDP packet also carries 28 bytes of IP and UDP headers that internet providers count.
	//voice sends about 50 small packets a second, so the headers are a real share of voice data
	new Counter({
		name: 'mirror_network_packets_total',
		help: 'UDP (voice) packets Mirror has sent and received; each carries 28 bytes of IP and UDP headers',
		labelNames: ['protocol', 'direction'],
		registers: [registry],
		collect() {
			raiseTo(this, { protocol: 'udp', direction: 'received' }, udpPacketsReceived);
			raiseTo(this, { protocol: 'udp', direction: 'sent' }, udpPacketsSent);
		},
	});
	new Counter({
		name: 'mirror_song_download_bytes_total',
		help: 'Audio yt-dlp downloaded for songs and intros, as handed to the bot; the download itself runs a few percent larger',
		registers: [registry],
		collect() {
			let bytes = downloadClosedBytes;
			for (const output of openDownloads) bytes += output.bytesRead;
			raiseTo(this, {}, bytes);
		},
	});
	new Gauge({
		name: 'mirror_guilds',
		help: 'Servers Mirror is in',
		registers: [registry],
		collect() {
			this.set(bot.client.guilds.cache.size);
		},
	});
	new Gauge({
		name: 'mirror_voice_connections',
		help: 'Servers where Mirror is connected to a voice channel',
		registers: [registry],
		collect() {
			this.set(bot.player.nodes.cache.filter((queue) => queue.connection).size);
		},
	});
	new Gauge({
		name: 'mirror_queues_playing',
		help: 'Servers where Mirror is playing audio right now',
		registers: [registry],
		collect() {
			this.set(bot.player.nodes.cache.filter((queue) => queue.isPlaying()).size);
		},
	});
	new Gauge({
		name: 'mirror_gateway_ping_milliseconds',
		help: "Round trip time to Discord's gateway",
		registers: [registry],
		collect() {
			//the ping reads 0 or -1 until Discord answers the first heartbeat
			if (bot.client.ws.ping > 0) this.set(bot.client.ws.ping);
		},
	});
	const gatewayReconnects = new Counter({
		name: 'mirror_gateway_reconnects_total',
		help: "Times Mirror lost its connection to Discord's gateway and reconnected",
		registers: [registry],
	});
	bot.client.on('shardReconnecting', () => gatewayReconnects.inc());

	//walking the folders touches every intro file, so sizes are refreshed every few minutes
	//rather than on each scrape
	const folderBytes = new Gauge({
		name: 'mirror_folder_bytes',
		help: 'Disk space used by the folders Mirror writes to',
		labelNames: ['folder'],
		registers: [registry],
	});
	const measureFolders = async () => {
		for (const folder of ['data', 'logs']) {
			const size = await folderSize(path.resolve(folder)).catch(() => undefined);
			if (size !== undefined) folderBytes.set({ folder }, size);
		}
	};
	measureFolders();
	setInterval(measureFolders, 5 * 60 * 1000).unref();

	const server = http.createServer(async (request, response) => {
		if (request.url !== '/metrics') {
			response.writeHead(404).end();
			return;
		}
		try {
			const body = await registry.metrics();
			response.writeHead(200, { 'Content-Type': registry.contentType }).end(body);
		} catch (error) {
			bot.logger.error('Could not collect metrics:', error);
			response.writeHead(500).end();
		}
	});
	//a port already in use should not take the bot down with it
	server.on('error', (error) => bot.logger.error('Metrics server stopped:', error));
	server.listen(port, '127.0.0.1', () =>
		bot.logger.info(`Metrics available at http://127.0.0.1:${port}/metrics`)
	);
}
