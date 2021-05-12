import "jest-preset-angular";
import { Bulb, HSBK } from "@lifx/api";

declare global {
	var electron: {
		platform: string;
		getAppVersion(): Promise<string>;
		discovery(): Promise<Bulb[]>;
		getColor(id: string): Promise<HSBK>;
		setColor(id: string, color: HSBK): Promise<void>;
	}
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
