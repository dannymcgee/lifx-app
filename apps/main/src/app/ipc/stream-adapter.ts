import { Observable, Subject } from "rxjs";
import { filter, first, map } from "rxjs/operators";
import { Readable, Writable } from "stream";
import chalk from "chalk";
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
import { eq, Queue } from "@lifx/std";

const NANOS_IN_SEC = 1_000_000_000;

export class StreamAdapter {
	private _stream$ = new Subject<Message>();
	private _stdin: Writable;
	private _backlog: Record<Channel, Queue<Request>> = {
		[Channel.Discovery]: new Queue(1),
		[Channel.GetColor]: new Queue(1),
		[Channel.SetColor]: new Queue(1),
	};
	private _pending = {
		[Channel.Discovery]: 0,
		[Channel.GetColor]: 0,
		[Channel.SetColor]: 0,
	};

	constructor(
		stdin: Writable,
		stdout: Readable,
	) {
		this._stdin = stdin;
		stdout.on("data", this._onStdout);
		setTimeout(this._processBacklog);
	}

	send(channel: Channel, payload?: Request): StreamAdapter {
		// Handle back-pressure
		if (this._pending[channel]) {
			let backlog = this._backlog[channel];
			// Ignore duplicate requests
			if (eq(payload, backlog.peek())) return this;

			backlog.enqueue(payload ?? null);
			console.log(`WARNING: ${
				this._backlog[channel].size
			} messages in backlog for ${channel}`);

			return this;
		}

		++this._pending[channel];

		let msg = JSON.stringify({
			channel,
			payload: payload ?? null,
		});

		this._stdin.write(msg + "\n", (err?: Error) => {
			if (err) {
				console.log(chalk.bold.redBright(err.message));
				console.log(chalk.bold.red(err.stack));
			}
		});

		return this;
	}

	recvAll(channel: Channel.Discovery): Observable<Response[Channel.Discovery]>;
	recvAll(channel: Channel.GetColor): Observable<Response[Channel.GetColor]>;
	recvAll(channel: Channel.SetColor): Observable<Response[Channel.SetColor]>;

	recvAll(chan: any) {
		return this._stream$.pipe(
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

	private _processBacklog = () => {
		Object.entries(this._pending)
			.forEach(([chan, count]: [Channel, number]) => {
				if (count) return;

				let backlog = this._backlog[chan];
				if (!backlog.size) return;

				this.send(chan, backlog.dequeue());
			});

		setTimeout(this._processBacklog);
	}

	private _onStdout = (buf: Buffer) => {
		let data = buf.toString();
		let msg: Message;

		try {
			msg = JSON.parse(data) as Message;
		} catch (err) {
			console.log("Error parsing message from back-end:");
			console.log(data);
			msg = null;
		}

		if (msg) {
			--this._pending[msg.channel];
			this._stream$.next(msg);
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
				return null;
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
}
