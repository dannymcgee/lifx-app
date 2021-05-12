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
	setColor(targets) {
		return ipcRenderer.invoke(Channel.SetColor, targets);
	},
}

contextBridge.exposeInMainWorld("electron", api);
