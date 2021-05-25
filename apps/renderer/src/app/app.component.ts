import {
	ChangeDetectorRef,
	Component,
	OnDestroy,
	OnInit,
	TrackByFunction,
} from "@angular/core";

import { combineLatest, interval, Observable, Subject } from "rxjs";
import { first, scan, share, takeUntil } from "rxjs/operators";

import { Bulb, HSBK } from "@lifx/api";
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

	groupLocks: Record<string, boolean> = {};
	groupScheduleEnabled: Record<string, boolean> = {};
	groupColors: Record<string, HSBK> = {};

	stops = ["#AD5910", "#2244FF"];

	private _onDestroy$ = new Subject<void>();

	constructor(
		private _changeDetector: ChangeDetectorRef,
		private _lifx: LifxService,
	) {}

	async ngOnInit() {
		let bulbs$ = this._lifx.bulbs$;

		bulbs$.pipe(first()).subscribe(() => {
			this.loading = false;
		});

		this.groups$ = bulbs$.pipe(
			scan((acc, curr) => {
				curr.forEach(b => {
					if (!b.group) return;
					if (!acc.includes(b.group)) {
						acc.push(b.group);
						this.groupLocks[b.group] = true;
					}
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

		combineLatest([this.groups$, this.bulbs$])
			.pipe(takeUntil(this._onDestroy$))
			.subscribe(([groups, bulbs]) => {
				groups.forEach(g => {
					if (this.groupColors[g]) return;

					let color: HSBK = bulbs[g]?.reduce((acc, b) => {
						if (b.color) return b.color;
						else return acc as any;
					}, null);

					this.groupColors[g] = color;
				});
			});

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

	async setGroupColor(group: string, color: HSBK) {
		let bulbIds = (await this.bulbs$
			.pipe(share(), first())
			.toPromise())
			[group]
			?.map(b => b.id);
		let targets = bulbIds.reduce((acc, id) => {
			acc[id] = color;
			return acc;
		}, {});

		this.groupColors[group] = { ...color };
		this._lifx.setColors(targets, 0.25);
	}

	schedule() {}
}
