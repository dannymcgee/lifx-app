import { coerceBooleanProperty, coerceNumberProperty } from "@angular/cdk/coercion";
import { Func } from "../types";

type Coerced<Ctor> = Ctor extends new (args?: any) => infer R ? R : never;

export function Coerce(type: typeof Number | typeof Boolean): PropertyDecorator {
	return (proto, propName: string) => {
		let fieldKey = Symbol(propName);
		let coerceValue: Func<[any], Coerced<typeof type>>;

		switch (type) {
			case Number:
				coerceValue = coerceNumberProperty;
				break;
			case Boolean:
				coerceValue = coerceBooleanProperty;
				break;
		}

		Object.defineProperty(proto, propName, {
			get(): Coerced<typeof type> {
				return this[fieldKey];
			},
			set(value: any) {
				this[fieldKey] = coerceValue(value);
			},
			enumerable: true,
			configurable: true,
		});
	}
}
