export interface Message {
	channel: Channel;
	payload?: Request|Response;
}

export enum Channel {
	Discovery = "Discovery",
	GetColor = "GetColor",
	SetColor = "SetColor",
}

export enum PowerLevel {
	StandBy,
	Enabled,
}

export type HSBK = {
	hue: number;
	saturation: number;
	brightness: number;
} | {
	kelvin: number;
	brightness: number;
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

export interface Request {
	[Channel.Discovery]?: null;
	[Channel.GetColor]?: {
		id: number;
	};
	[Channel.SetColor]?: {
		id: number;
		color: HSBK;
	};
}

export interface Response {
	[Channel.Discovery]?: Bulb[];
	[Channel.GetColor]?: {
		id: number;
		color: HSBK;
	};
	[Channel.SetColor]?: null;
}

