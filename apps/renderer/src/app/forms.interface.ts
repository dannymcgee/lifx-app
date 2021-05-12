import { ControlValueAccessor } from "@angular/forms";

export interface FormControl<T> extends ControlValueAccessor {
	writeValue(value?: T): void;
	registerOnChange(fn: (value?: T) => void): void;
}
