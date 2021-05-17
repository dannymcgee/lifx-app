import path from "path";
import { ipcMain } from "electron";
import { noop } from "rxjs";
import { filter, first, map } from "rxjs/operators";

import { Channel, Request } from "@lifx/api";
import { BACKEND_EXE_PATH } from "../constants";
import { IpcPipe } from "./pipe";

namespace ipc {

	export function init() {
		let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
		let pipe = new IpcPipe(exe);

		ipcMain.handle(Channel.Discovery, () => {
			return pipe
				.send(Channel.Discovery)
				.recv(Channel.Discovery).toPromise();
		});

		ipcMain.handle(Channel.GetColor, (_, payload) => {
			return pipe
				.send(Channel.GetColor, payload)
				.recvAll(Channel.GetColor).pipe(
					filter(p => p.id === payload.id),
					map(p => p.color),
					first(),
				).toPromise();
		});

		ipcMain.handle(Channel.SetColor, (_, payload: Request["SetColor"]) => {
			let keys = Object.keys(payload.values);
			return pipe
				.send(Channel.SetColor, payload)
				.recvAll(Channel.SetColor).pipe(
					filter(ids => ids.every(id => keys.includes(id))),
					map(noop),
					first(),
				).toPromise();
		});
	}

}

export default ipc;
