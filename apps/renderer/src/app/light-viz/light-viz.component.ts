import {
	ChangeDetectionStrategy,
	Component,
	Input,
} from "@angular/core";

import chroma from "chroma-js";

@Component({
	selector: "lifx-light-viz",
	templateUrl: "./light-viz.component.html",
	"styleUrls": ["./light-viz.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LightVizComponent {
	@Input() brightness: number;
	@Input()
	get kelvin(): number { return this._kelvin; }
	set kelvin(value: number) {
		this._rgb = chroma.temperature(value).rgb();
		this._kelvin = value;
	}
	private _kelvin: number;
	private _rgb: [number, number, number];

	get color(): string {
		return this._alpha(this.brightness);
	}

	get mainColor(): string {
		return this._alpha(Math.min(this.brightness * 2, 1));
	}

	get glow(): string|null {
		let size = 8 * this.brightness;
		let innerSize = Math.max(size * 2, 8);
		let innerBright = Math.min(this.brightness * 2, 1);

		return `
			0 0 ${innerSize}px 0 ${this._alpha(innerBright)},
			0 0 ${innerSize}px 0 ${this._alpha(innerBright)},
			0 0 ${size * 5}px ${size * 2.5}px ${this.color},
			0 0 ${size * 10}px ${size * 5}px ${this._alpha(this.brightness / 2)}
		`
			.trim()
			.replace(/\s+/g, " ");
	}

	private _alpha(a: number): string {
		let [r,g,b] = this._rgb;
		return `rgba(${r},${g},${b},${a})`;
	}
}
