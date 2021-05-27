import { Func } from "../types";

export function Loop(
	proto: Object,
	methodName: string,
	descriptor: TypedPropertyDescriptor<Func>,
) {
	let originalOnInit: Func|undefined = proto["ngOnInit"];
	let originalOnDestroy: Func|undefined = proto["ngOnDestroy"];
	let originalMethod: Func = proto[methodName];

	let frameRequest = Symbol("frameRequest");

	Object.defineProperties(proto, {
		ngOnInit: {
			value(): void {
				originalOnInit?.call(this);

				this[frameRequest] = requestAnimationFrame(() => {
					this[methodName].call(this)
				});
			}
		},
		ngOnDestroy: {
			value(): void {
				originalOnDestroy?.call(this);

				if (this[frameRequest]) {
					cancelAnimationFrame(this[frameRequest]);
				}
			}
		},
	});

	descriptor.value = function (): void {
		originalMethod?.call(this);

		this[frameRequest] = requestAnimationFrame(() => {
			this[methodName].call(this)
		});
	}
}
