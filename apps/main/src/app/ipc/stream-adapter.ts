import { Observable, Subject } from "rxjs";
import { filter, first, map } from "rxjs/operators";
import { Readable, Writable } from "stream";
import chalk from "chalk";

import { Channel, Message, Payload } from "@lifx/api";

export class StreamAdapter {
	private _stream$ = new Subject<Message>();
	private _stdin: Writable;

	constructor(
		stdin: Writable,
		stdout: Readable,
	) {
		this._stdin = stdin;

		stdout.on("data", (buf: Buffer) => {
			let data = buf.toString();
			try {
				let msg = JSON.parse(data) as Message;
				this._stream$.next(msg);
			}
			catch {}
		});
	}

	send(channel: Channel, payload?: Payload): StreamAdapter {
		let msg = JSON.stringify({
			channel,
			payload: payload ?? null,
		});
		this._stdin.write(`${msg}\n`, (err?: Error) => {
			if (err) {
				console.log(chalk.bold.redBright(err.message));
				console.log(chalk.bold.red(err.stack));
			}
		});

		return this;
	}

	recvAll(channel: Channel): Observable<Payload> {
		return this._stream$.pipe(
			filter(msg => msg.channel === channel),
			map(msg => msg.payload[channel]),
		);
	}

	recv(channel: Channel): Observable<Payload> {
		return this.recvAll(channel).pipe(first());
	}
}
