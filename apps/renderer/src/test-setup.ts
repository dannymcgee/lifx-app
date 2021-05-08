import "jest-preset-angular";

declare global {
	var electron: {
		getAppVersion(): Promise<string>,
		send(message: string): Promise<string>,
		platform: string;
	}
}

const electron: PropertyDescriptor["value"] = {
	getAppVersion: async () => "",
	send: async (_: string) => "",
	platform: "Jest",
}

Object.defineProperty(global, "electron", { value: electron });
Object.defineProperty(window, "electron", { value: electron });
