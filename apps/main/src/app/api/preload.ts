import { contextBridge, ipcRenderer } from "electron";

import { Bulb, Channel, HSBK } from "@lifx/api";

contextBridge.exposeInMainWorld("electron", {
	getAppVersion(): Promise<string> {
		return ipcRenderer.invoke("get-app-version");
	},
	discovery(): Promise<Bulb[]> {
		return ipcRenderer.invoke(Channel.Discovery);
	},
	getColor(id: number): Promise<HSBK> {
		return ipcRenderer.invoke(Channel.GetColor, { id });
	},
	setColor(id: number, color: HSBK): Promise<void> {
		return ipcRenderer.invoke(Channel.SetColor, { id, color });
	},
});
