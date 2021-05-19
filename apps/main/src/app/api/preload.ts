import { contextBridge, ipcRenderer } from "electron";
import { Channel, ElectronIPC } from "@lifx/api";

const api: ElectronIPC = {
	getAppVersion() {
		return ipcRenderer.invoke("get-app-version");
	},
	discovery() {
		return ipcRenderer.invoke(Channel.Discovery);
	},
	getColor(id) {
		return ipcRenderer.invoke(Channel.GetColor, { id });
	},
	setColor(targets, secs) {
		return ipcRenderer.invoke(Channel.SetColor, {
			values: targets,
			duration: { secs },
		});
	},
	closeWindow() {
		return ipcRenderer.invoke("window-close");
	},
	minimizeWindow() {
		return ipcRenderer.invoke("window-minimize");
	},
	toggleMaximized(): Promise<boolean> {
		return ipcRenderer.invoke("window-toggle-max");
	}
}

contextBridge.exposeInMainWorld("electron", api);
