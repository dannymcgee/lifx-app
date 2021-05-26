import { MockLight } from "@lifx/api";

declare const __BUILD_VERSION__: string;

export const environment = {
	production: false,
	mock: true,
	version: __BUILD_VERSION__,
	lights: [
		new MockLight("Bedroom", "Ceiling"),
		new MockLight("Bedroom", "Ceiling"),
		new MockLight("Office", "Ceiling"),
		new MockLight("Office", "Ceiling"),
	],
};
