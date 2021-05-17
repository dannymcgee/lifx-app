export function lerp(t: number, range: [number, number]): number {
	return range[0] + t * (range[1] - range[0]);
}

export function invLerp(value: number, range: [number, number]): number {
	return (value - range[0]) / (range[1] - range[0]);
}

export function remap(
	value: number,
	from: [number, number],
	to: [number, number],
): number {
	let t = invLerp(value, [from[0], from[1]]);

	return lerp(t, [to[0], to[1]]);
}
