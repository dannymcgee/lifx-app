import { clamp } from "./clamp";

// TODO: This is kind of a terrible name
export class Stepper<T> {
	private _data: T[];
	private get _len(): number {
		return this._data.length;
	}
	private _ptr: number;

	constructor(
		iter: Iterable<T>,
		startIdx = 0,
	) {
		this._data = Array.from(iter);
		this._ptr = startIdx;
	}

	get(): T {
		return this._data[this._ptr];
	}

	inc(): T {
		this._ptr = clamp(this._ptr + 1, [0, this._len - 1]);
		return this.get();
	}

	dec(): T {
		this._ptr = clamp(this._ptr - 1, [0, this._len - 1]);
		return this.get();
	}
}
