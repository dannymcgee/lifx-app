import { ControlValueAccessor } from "@angular/forms";

export interface Func<Args extends any[] = [], Return = void> {
	(...args: Args): Return;
}

export interface FormControl<T> extends ControlValueAccessor {
	writeValue(value?: T): void;
	registerOnChange(fn: (value?: T) => void): void;
}

