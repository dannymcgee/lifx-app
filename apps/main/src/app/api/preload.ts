import { contextBridge, ipcRenderer } from "electron";

import { Bulb, Channel } from "@lifx/api";

contextBridge.exposeInMainWorld("electron", {
	getAppVersion: () => ipcRenderer.invoke("get-app-version"),
	discovery: (): Promise<Bulb[]> => ipcRenderer.invoke(Channel.Discovery),
});
