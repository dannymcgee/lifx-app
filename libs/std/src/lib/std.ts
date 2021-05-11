export class Queue<T> {
	private _data: T[] = [];
	private _capacity: number;

	get size() { return this._data.length; }

	constructor(capacity?: number) {
		this._capacity = capacity ?? Number.POSITIVE_INFINITY;
	}

	enqueue(it: T) {
		this._data.push(it);
		if (this.size > this._capacity) {
			this.dequeue();
		}
	}
	dequeue() {
		return this._data.shift();
	}
	peek() {
		return this._data[0];
	}
}

export class Stack<T> {
	private _data = new Array<T>();

	get size() { return this._data.length; }

	push(it: T) {
		this._data.push(it);
	}
	pop() {
		return this._data.pop();
	}
}

export function sleep(timeout: number) {
	return new Promise(resolve => {
		setTimeout(resolve, timeout);
	});
}

export function eq(a: unknown, b: unknown): boolean {
	// Both nullish
	if (a == null && b == null) return true;

	// Coerce to different booleans
	if (!a && !!b) return false;
	if (!!a && !b) return false;

	// Different basic types
	if (typeof a !== typeof b) return false;

	// Simple check for primitive types
	switch (typeof a) {
		case "string":
		case "boolean":
		case "number":
		case "bigint":
			return a === b;
	}
	// Complex types from here on...

	if (Array.isArray(a)) {
		// Array vs non-array
		if (!Array.isArray(b)) return false;
		// Recursively compare each array element
		return a.every((val, idx) => eq(val, b[idx]));
	}

	// Recursively compare each enumerable key/value pair of an object
	return Object.keys(a).every(key => eq(a[key], b[key]));
}
