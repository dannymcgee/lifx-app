import "jest-preset-angular";
import { Bulb } from "@lifx/api";

declare global {
	var electron: {
		getAppVersion(): Promise<string>,
		discovery(): Promise<Bulb[]>,
		platform: string;
	}
}

const electron: PropertyDescriptor["value"] = {
	getAppVersion: async () => "",
	discovery: async (_: string) => [],
	platform: "Jest",
}

Object.defineProperty(global, "electron", { value: electron });
Object.defineProperty(window, "electron", { value: electron });
