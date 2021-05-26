import { v1 as uuid } from "uuid";
import { U16_MAX } from "./constants";
import { Bulb, PowerLevel } from "./types";

export class MockLight implements Bulb {
	id = uuid();
	addr = "localhost";
	lastSeen = new Date();
	model: [number, number] = [0, 0];
	location = "MOCK";
	powerLevel = PowerLevel.Enabled;
	color = {
		brightness: U16_MAX,
		kelvin: 6500,
	};

	constructor(
		public group: string,
		public name: string,
	) {}
}
