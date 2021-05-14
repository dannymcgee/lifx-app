import { ChangeDetectorRef, Component, HostBinding, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

import chroma, { Color } from "chroma-js";

import { HSBK, isFullColor, Kelvin, u16, u16toFloat } from "@lifx/api";
import { FormControl } from "../forms.interface";

const U16_MAX = 65_535;

@Component({
	selector: "lifx-color",
	templateUrl: "./color.component.html",
	styleUrls: ["./color.component.scss"],
})
export class ColorComponent implements FormControl<HSBK> {
	@Input() id: string;
	@Input() readOnly: boolean;

	@HostBinding("style.background-color")
	get bgColor(): string { return this._viz?.css() ?? null; }
	_viz: Color;

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

		if (!value) {
			this._viz = chroma.hex("#0000");
			return;
		}

		if (isFullColor(value)) {
			this._viz = chroma.hsv(
				u16toFloat(value.hue) * 360,
				u16toFloat(value.saturation),
				u16toFloat(value.brightness),
			);
		} else {
			this._viz = chroma.temperature(value.kelvin);
		}
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
