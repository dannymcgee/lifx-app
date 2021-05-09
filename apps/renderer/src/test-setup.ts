import "jest-preset-angular";
import { Observable, of } from "rxjs";
import { Bulb } from "@lifx/api";

declare global {
	var electron: {
		getAppVersion(): Promise<string>,
		discovery(): Observable<Bulb[]>,
		platform: string;
	}
}

const electron: PropertyDescriptor["value"] = {
	getAppVersion: async () => "",
	discovery: (_: string) => of([]),
	platform: "Jest",
}

Object.defineProperty(global, "electron", { value: electron });
Object.defineProperty(window, "electron", { value: electron });
