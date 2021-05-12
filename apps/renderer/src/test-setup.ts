import "jest-preset-angular";
import { ElectronIPC } from "@lifx/api";

declare global {
	var electron: ElectronIPC;
}

const electron: PropertyDescriptor["value"] = {
	platform: "Jest",
	getAppVersion: async () => "",
	discovery: async () => [],
	getColor: async () => null,
	setColor: async () => {},
}

Object.defineProperty(global, "electron", { value: electron });
Object.defineProperty(window, "electron", { value: electron });
