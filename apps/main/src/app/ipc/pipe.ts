import { Observable, Subject } from "rxjs";
import { filter, first, map } from "rxjs/operators";
import { Readable, Writable } from "stream";
import chalk from "chalk";
import cp from "child_process";
import { promises as fs } from "fs";
import sub from "date-fns/sub";

import {
	Bulb,
	Channel,
	HSBK,
	Message,
	PowerLevel,
	Request,
	Response,
} from "@lifx/api";
import { Queue } from "@lifx/std";
import log from "./log";
import { environment } from "../../environments/environment";
import { environment as mockEnvironment } from "../../environments/environment.mock";

let env = environment;

const NANOS_IN_SEC = 1_000_000_000;

export class IpcPipe {
	private _input: Readable;
	private _output: Writable;
	private _input$ = new Subject<Message>();

	private _backlog: Record<Channel, Queue<Request[Channel]>> = {
		[Channel.Discovery]: new Queue(1),
		[Channel.GetColor]: new Queue(1),
		[Channel.SetColor]: new Queue(1),
	};

	private _pending: Record<Channel, number> = {
		[Channel.Discovery]: 0,
		[Channel.GetColor]: 0,
		[Channel.SetColor]: 0,
	};

	private get _allPending(): number {
		return Object.values(this._pending).reduce((acc, cur) => acc + cur);
	}

	constructor(exePath: string) {
		(async () => {
			// FIXME: Do this through a builder configuration (blocked by upstream issue)
			try {
				await fs.stat(exePath);
			} catch {
				env = mockEnvironment;
				this._input = process.stdin;
				this._output = process.stdout;

				return;
			}

			let proc = cp.spawn(exePath, {
				stdio: ["pipe", "pipe", "inherit"],
			})
				.on("close", this._onClose)
				.on("exit", this._onExit)
				.on("error", this._onError);

			this._input = proc.stdout;
			this._output = proc.stdin;

			this._input.on("data", this._parseInput);

			setTimeout(this._processBacklog);
		})();
	}

	send(channel: Channel, payload?: Request[typeof channel]): this {
		// Handle back-pressure
		if (this._pending[channel] || this._allPending > 0) {
			log.debug(`Backlogging ${channel} request:`, payload ?? null);
			this._backlog[channel].enqueue(payload ?? null);

			return this;
		}

		++this._pending[channel];
		log.request(channel, payload);

		let msg = JSON.stringify({
			channel,
			payload: payload ?? null,
		});

		this._output.write(msg + "\n", (err?: Error) => {
			if (err) {
				console.log(chalk.bold.redBright(err.message));
				console.log(chalk.bold.red(err.stack));
			}
		});

		if (env.mock) setTimeout(() => {
			this._mockResponse(channel, payload);
		});

		return this;
	}

	recvAll(channel: Channel.Discovery): Observable<Response[Channel.Discovery]>;
	recvAll(channel: Channel.GetColor): Observable<Response[Channel.GetColor]>;
	recvAll(channel: Channel.SetColor): Observable<Response[Channel.SetColor]>;

	recvAll(chan: any) {
		return this._input$.pipe(
			filter(msg => msg.channel === chan),
			map(msg => this._fmt(chan, msg.payload)),
		) as any;
	}

	recv(channel: Channel.Discovery): Observable<Response[Channel.Discovery]>;
	recv(channel: Channel.GetColor): Observable<Response[Channel.GetColor]>;
	recv(channel: Channel.SetColor): Observable<Response[Channel.SetColor]>;

	recv(channel: any) {
		return this.recvAll(channel).pipe(first()) as any;
	}

	private _mockResponse(
		channel: Channel,
		payload?: Request[typeof channel],
	) {
		switch (channel) {
			case Channel.Discovery: {
				this._parseInput(JSON.stringify({
					channel,
					payload: {
						[channel]: env.lights
					},
				}));
				break;
			}
			case Channel.GetColor: {
				break;
			}
			case Channel.SetColor: {
				this._parseInput(JSON.stringify({
					channel,
					payload: {
						[channel]: Object.keys(payload["values"]),
					},
				}));
				break;
			}
		}
	}

	private _processBacklog = () => {
		Object.entries(this._backlog)
			.forEach(([chan, backlog]) => {
				if (this._allPending) return;
				if (!backlog.size) return;

				log.debug(`Sending ${chan} request:`, backlog.peek() ?? null);
				this.send(chan as Channel, backlog.dequeue());
			});

		setTimeout(this._processBacklog);
	}

	private _parseInput = (buf: Buffer|string) => {
		let data = buf.toString();
		let msg: Message;

		try {
			msg = JSON.parse(data);
		} catch (err) {
			console.log("Error parsing message from back-end:");
			console.log(data);
			msg = null;
		}

		if (msg) {
			--this._pending[msg.channel];
			log.response(msg.channel, msg.payload as Response);

			this._input$.next(msg);
		}
	}

	private _fmt(chan: Channel, payload: any) {
		switch (chan) {
			case Channel.Discovery:
				return payload[chan].map(this._fmtBulb);
			case Channel.GetColor:
				return {
					id: payload[chan].id,
					color: this._fmtColor(payload[chan].color),
				};
			case Channel.SetColor:
				return payload[chan];
			default: {
				console.log(chalk.bold.redBright(`Unrecognized channel: ${chan}`));
			}
		}
	}

	private _fmtBulb = (data: any): Bulb => ({
		id: data.id,
		addr: data.addr,
		lastSeen: this._fmtLastSeen(data.last_seen),
		model: data.model,
		location: data.location,
		group: data.group,
		name: data.name,
		powerLevel: data.power_level ? PowerLevel.Enabled : PowerLevel.StandBy,
		color: this._fmtColor(data.color),
	});

	private _fmtLastSeen(data: any): Date {
		if (!data) return null;

		let seconds = data.secs ?? 0;
		let nanos = data.nanos ?? 0;
		seconds += (nanos / NANOS_IN_SEC);

		return sub(Date.now(), { seconds });
	}

	private _fmtColor(data: any): HSBK | HSBK[] {
		if (!data) return null;
		if (env.mock) return data;

		if (data.Single) {
			let c = data.Single;
			if (c.saturation) return {
				hue: c.hue,
				saturation: c.saturation,
				brightness: c.brightness,
			};
			else return {
				kelvin: c.kelvin,
				brightness: c.brightness,
			};
		}
		else if (data.Multiple) {
			return data.Multiple.map(c => this._fmtColor({ Single: c }))
		}
	}

	private _onClose = (code: number, signal: NodeJS.Signals|null) => {
		console.log("onClose:", { code, signal });
	}

	private _onExit = (code: number|null, signal: NodeJS.Signals|null) => {
		console.log("onExit:", { code, signal });
	}

	private _onError = (err: Error) => {
		console.log("onError:", { err });
	}
}
