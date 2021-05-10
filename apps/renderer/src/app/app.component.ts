import { ChangeDetectorRef, Component, OnDestroy, OnInit, TrackByFunction } from "@angular/core";

import { interval, Observable, Subject } from "rxjs";
import { first, scan, takeUntil } from "rxjs/operators";

import { Bulb } from "@lifx/api";
import { LifxService } from "./lifx.service";

@Component({
	selector: "lifx-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
	groups$?: Observable<string[]>;
	bulbs$?: Observable<Record<string, Bulb[]>>;
	loading = true;

	private _onDestroy$ = new Subject<void>();

	constructor(
		private _changeDetector: ChangeDetectorRef,
		private _lifx: LifxService,
	) {}

	async ngOnInit() {
		let bulbs$ = this._lifx.discover();

		bulbs$.pipe(first()).subscribe(() => {
			this.loading = false;
		});

		this.groups$ = bulbs$.pipe(
			scan((acc, curr) => {
				curr.forEach(b => {
					if (!b.group) return;
					if (!acc.includes(b.group)) acc.push(b.group);
				});
				return acc;
			}, []),
		);

		this.bulbs$ = bulbs$.pipe(
			scan((acc, curr) => {
				curr.forEach(bulb => {
					if (!bulb.group) return;
					if (!acc[bulb.group]) acc[bulb.group] = [];

					let arr: Bulb[] = acc[bulb.group];
					let idx = arr.findIndex(b => b.id === bulb.id);

					if (idx !== -1) arr[idx] = bulb;
					else arr.push(bulb);
				});
				return acc;
			}, {}),
		);

		interval(1000)
			.pipe(takeUntil(this._onDestroy$))
			.subscribe(() => {
				this._changeDetector.markForCheck();
			});
	}

	ngOnDestroy() {
		this._onDestroy$.next();
		this._onDestroy$.complete();
	}

	trackById: TrackByFunction<Bulb> = (_, bulb) => bulb.id;
}
