import { ChangeDetectorRef, Component, HostBinding, Input, ViewEncapsulation } from "@angular/core";
import { NgControl } from "@angular/forms";

import { HSBK, Kelvin, u16, U16_MAX } from "@lifx/api";
import { Coerce } from "../decorators";
import { FormControl } from "../types";

@Component({
	selector: "lifx-color",
	templateUrl: "./color.component.html",
	styleUrls: ["./color.component.scss"],
	encapsulation: ViewEncapsulation.None,
})
export class ColorComponent implements FormControl<HSBK> {
	@HostBinding("class") hostClass = "lifx-color";

	@Input() id: string;
	@Input() readOnly: boolean;

	@HostBinding("style.height.px")
	@Input() @Coerce(Number) size = 36;

	@HostBinding("style.gap.px")
	get gap() { return this.size * 0.5625; }

	get value(): HSBK|null { return this._value ?? null; }
	private _value?: HSBK;

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
		setTimeout(() => {
			this._changeDetector.markForCheck();
		});
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
