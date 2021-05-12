import { u16 } from "./types";
import { U16_MAX } from "./constants";

export function u16toFloat(value: u16): number {
	return value / U16_MAX;
}
