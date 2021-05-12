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

export type u16 = number;
/** Range: 1500-9000 */
export type Kelvin = number;

export type HSBK = {
	hue: u16;
	saturation: u16;
	brightness: u16;
} | {
	kelvin: Kelvin;
	brightness: u16;
}

export interface Bulb {
	id: string;
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
	[Channel.GetColor]?: { id: string };
	[Channel.SetColor]?: Record<string, HSBK>;
}

export interface Response {
	[Channel.Discovery]?: Bulb[];
	[Channel.GetColor]?: {
		id: string;
		color: HSBK;
	};
	[Channel.SetColor]?: string[];
}

export interface ElectronIPC {
	platform?: string;
	getAppVersion(): Promise<string>;
	discovery(): Promise<Bulb[]>;
	getColor(id: string): Promise<HSBK>;
	setColor(targets: Record<string, HSBK>): Promise<void>;
}
