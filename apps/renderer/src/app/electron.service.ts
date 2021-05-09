import { Injectable } from "@angular/core";

import { Channel } from "@lifx/api";
import { IpcService } from "./ipc.service";

@Injectable({
	providedIn: "root",
})
export class LifxService {
	constructor(
		private _ipc: IpcService
	) {}

	async discover() {
		while (true) {
			let bulbs: any[] = await this._ipc.send(Channel.Discovery);

			if (isIncomplete(bulbs)) continue;
			else return bulbs;
		}
	}
}

function isIncomplete(data: any): boolean {
	if (data == null)
		return true;

	if (Array.isArray(data))
		return data.some(isIncomplete)

	if (typeof data === "object")
		return Object.values(data).some(isIncomplete)

	return false;
}
