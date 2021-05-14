import { FullColor, HSBK, u16, White } from "./types";
import { U16_MAX } from "./constants";

export function u16toFloat(value: u16): number {
	return value / U16_MAX;
}

export function isWhite(color: HSBK): color is White {
	return !isFullColor(color);
}

export function isFullColor(color: HSBK): color is FullColor {
	return "saturation" in color && color.saturation > 0;
}
