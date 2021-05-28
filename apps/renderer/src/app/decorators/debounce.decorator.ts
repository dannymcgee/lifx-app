import { Func } from "../types";

export function Debounce(delay: number): MethodDecorator {
	return (proto, methodName, descriptor) => {
		let originalOnDestroy: Func|undefined = proto["ngOnDestroy"];
		let originalMethod: Func<any[]> = proto[methodName];

		let timeout = Symbol("debounceTimeout");

		Object.defineProperty(proto, "ngOnDestroy", {
			value(): void {
				originalOnDestroy?.call(this);

				if (this[timeout]) clearTimeout(this[timeout]);
			},
			enumerable: true,
			configurable: true,
		});

		descriptor.value = function (...args: any[]): void {
			if (this[timeout]) clearTimeout(this[timeout]);

			this[timeout] = setTimeout(() => {
				originalMethod.call(this, ...args);
			}, delay);
		} as unknown as typeof descriptor.value;

		return descriptor;
	}
}
