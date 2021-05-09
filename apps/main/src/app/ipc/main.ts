import cp from "child_process";
import path from "path";
import { ipcMain } from "electron";

import { Channel } from "@lifx/api";
import { StreamAdapter } from "./stream-adapter";

const BACKEND_EXE_PATH = "apps/back-end/target/debug/back-end.exe";

namespace ipc {
	let proc: cp.ChildProcess;
	let adapter: StreamAdapter;

	export function init() {
		let exe = path.resolve(process.cwd(), BACKEND_EXE_PATH);
		proc = cp.spawn(exe, {
			stdio: [
				"pipe",
				"pipe",
				process.stderr,
			]
		})
			.on("close", onChildClose)
			.on("exit", onChildExit)
			.on("error", onChildErr)

		adapter = new StreamAdapter(proc.stdin, proc.stdout);

		ipcMain.handle(Channel.Discovery, () => {
			return adapter
				.send(Channel.Discovery)
				.recv(Channel.Discovery).toPromise();
		});
	}

	function onChildClose(code: number, signal: NodeJS.Signals|null) {
		console.log("onClose:", { code, signal });
	}

	function onChildExit(code: number|null, signal: NodeJS.Signals|null) {
		console.log("onExit:", { code, signal });
	}

	function onChildErr(err: Error) {
		console.log("onError:", { err });
	}
}

export default ipc;
