import { Injectable } from "@angular/core";

import { Channel, Message, Payload } from "@lifx/api";

@Injectable({
	providedIn: "root",
})
export class IpcService {
	async send(channel: Channel, payload?: Payload) {
		let msg = JSON.stringify({
			channel,
			payload: payload ?? null,
		});
		let res = await electron.send(msg);
		let { payload: response }: Message = JSON.parse(res);

		return response[channel];
	}
}
