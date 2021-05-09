export interface Message {
	channel: Channel;
	payload?: Payload;
}

export enum Channel {
	Discovery = "Discovery",
}

export interface Payload {}
