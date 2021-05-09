export interface Message {
	channel: Channel;
	payload?: Payload;
}

export enum Channel {
	Discovery = "Discovery",
}

export enum PowerLevel {
	StandBy,
	Enabled,
}

export interface HSBK {
	hue: number;
	saturation: number;
	brightness: number;
	kelvin: number;
}

export interface Bulb {
	id: number;
	addr: string;
	lastSeen: Date;
	model: [number, number];
	location: string;
	group: string;
	name: string;
	powerLevel: PowerLevel;
	color: HSBK | HSBK[];
}

export type Payload = Bulb[];
