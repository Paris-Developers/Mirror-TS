//optional stats about the bot itself, in the format Prometheus reads. set metrics_port in
//config.json to turn them on; they are served on 127.0.0.1 only, so nothing outside the machine
//running the bot can reach them. everything here describes Mirror's own process, so other
//programs on the same machine never show up in these numbers
import { Counter, Gauge, Registry, collectDefaultMetrics } from 'prom-client';
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
//song downloads happen inside yt-dlp, a separate process, and are not part of these numbers
let tcpClosedRead = 0;
let tcpClosedWritten = 0;
const openTcpSockets = new Set<net.Socket>();
let udpSent = 0;
let udpReceived = 0;

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
		if (isBound(this)) udpSent += datagramSize(args);
		return send.apply(this, args);
	} as typeof dgram.Socket.prototype.send;

	const emit = dgram.Socket.prototype.emit as (...args: unknown[]) => boolean;
	dgram.Socket.prototype.emit = function (this: dgram.Socket, ...args: unknown[]) {
		if (args[0] === 'message' && Buffer.isBuffer(args[1])) udpReceived += args[1].length;
		return emit.apply(this, args);
	} as typeof dgram.Socket.prototype.emit;
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

	//a counter only goes up, so each scrape adds whatever the totals grew by since the last one
	const reported = new Map<string, number>();
	new Counter({
		name: 'mirror_network_bytes_total',
		help: 'Bytes Mirror has sent and received, by protocol. TCP is counted after decryption; yt-dlp downloads are not included',
		labelNames: ['protocol', 'direction'],
		registers: [registry],
		collect() {
			let read = tcpClosedRead;
			let written = tcpClosedWritten;
			for (const socket of openTcpSockets) {
				read += socket.bytesRead;
				written += socket.bytesWritten;
			}
			const totals = [
				{ protocol: 'tcp', direction: 'received', bytes: read },
				{ protocol: 'tcp', direction: 'sent', bytes: written },
				{ protocol: 'udp', direction: 'received', bytes: udpReceived },
				{ protocol: 'udp', direction: 'sent', bytes: udpSent },
			];
			for (const { protocol, direction, bytes } of totals) {
				const key = `${protocol} ${direction}`;
				const growth = bytes - (reported.get(key) ?? 0);
				if (growth > 0) this.inc({ protocol, direction }, growth);
				else if (!reported.has(key)) this.inc({ protocol, direction }, 0);
				reported.set(key, Math.max(bytes, reported.get(key) ?? 0));
			}
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
