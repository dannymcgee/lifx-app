import { ChangeDetectorRef, Component, HostBinding, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

import { HSBK, Kelvin, u16 } from "@lifx/api";
import { FormControl } from "../forms.interface";

const U16_MAX = 65_535;

@Component({
	selector: "lifx-color",
	templateUrl: "./color.component.html",
	styleUrls: ["./color.component.scss"],
})
export class ColorComponent implements FormControl<HSBK> {
	@Input() id: string;

	private _value?: HSBK;
	get value(): HSBK|null { return this._value ?? null; }

	U16_MAX = U16_MAX;

	@HostBinding("class.disabled")
	disabled: boolean = false;

	constructor(
		ngControl: NgControl,
		private _changeDetector: ChangeDetectorRef,
	) {
		ngControl.valueAccessor = this;
	}

	updateBrightness(value: u16) {
		this.onChange({ ...this.value, brightness: value });
	}

	updateKelvin(value: Kelvin) {
		this.onChange({ ...this.value, kelvin: value });
	}

	writeValue(value?: HSBK): void {
		this._value = value;
		this._changeDetector.markForCheck();
	}

	onChange = (_?: HSBK) => {}
	registerOnChange(fn: (value?: HSBK) => void) {
		this.onChange = fn;
	}

	onTouched = () => {}
	registerOnTouched(fn: () => void) {
		this.onTouched = fn;
	}

	setDisabledState(value: boolean) {
		this.disabled = value;
	}
}
