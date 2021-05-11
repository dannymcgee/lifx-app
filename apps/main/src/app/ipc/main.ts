import path from "path";
import { ipcMain } from "electron";

import { Channel } from "@lifx/api";
import { IpcPipe } from "./stream-adapter";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";

namespace ipc {
	let pipe: IpcPipe;

	export function init() {
		let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
		pipe = new IpcPipe(exe);

		ipcMain.handle(Channel.Discovery, () => {
			return pipe
				.send(Channel.Discovery)
				.recv(Channel.Discovery).toPromise();
		});
	}
}

export default ipc;
