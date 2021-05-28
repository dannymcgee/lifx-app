import {
	Component,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	SimpleChanges,
	ViewEncapsulation,
} from "@angular/core";

import { merge, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { Bulb, HSBK, PowerLevel } from "@lifx/api";
import { LifxService } from "../lifx.service";

@Component({
	selector: "lifx-bulb",
	templateUrl: "./bulb.component.html",
	styleUrls: ["./bulb.component.scss"],
	encapsulation: ViewEncapsulation.None,
})
export class BulbComponent implements OnChanges, OnDestroy {
	@HostBinding("class") hostClass = "lifx-bulb";

	@HostBinding()
	@Input() id: string;
	@Input() readOnly: boolean;

	_bulb?: Bulb;

	get name() { return this._bulb?.name; }
	get lastSeen() { return this._bulb?.lastSeen; }

	get color(): HSBK { return this._color; }
	set color(value: HSBK) {
		this._color = { ...value };
		this._updateColor(value);
	}
	_color?: HSBK;

	get powerLevel(): PowerLevel { return this._powerLevel; }
	set powerLevel(value: PowerLevel) {
		this._powerLevel = value;
		this._updatePowerLevel(value);
	}
	_powerLevel?: PowerLevel;

	private _onDestroy$ = new Subject<void>();
	private _onChange$ = new Subject<void>();

	constructor(
		private _lifx: LifxService,
	) {}

	ngOnChanges({ id }: SimpleChanges) {
		if (id && id.currentValue !== id.previousValue) {
			this._onChange$.next();
			this._lifx.bulb(this.id)
				.pipe(takeUntil(merge(
					this._onChange$,
					this._onDestroy$
				)))
				.subscribe(bulb => {
					this._bulb = bulb;
					if (!this._color && bulb.color) {
						this._color = { ...bulb.color as HSBK };
					}
					if (this._powerLevel == null && bulb.powerLevel != null) {
						this._powerLevel = bulb.powerLevel;
					}
				});
		}
	}

	ngOnDestroy() {
		this._onDestroy$.next();
		this._onDestroy$.complete();
		this._onChange$.complete();
	}

	private async _updateColor(value: HSBK) {
		await this._lifx.setColor(this.id, value, 0.25);
	}

	private async _updatePowerLevel(value: PowerLevel) {
		await this._lifx.setPowerLevel(this.id, value);
	}
}
