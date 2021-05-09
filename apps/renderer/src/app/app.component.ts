import { Component, OnInit, TrackByFunction } from "@angular/core";

import { Observable } from "rxjs";
import { first, scan } from "rxjs/operators";

import { Bulb } from "@lifx/api";
import { LifxService } from "./lifx.service";

@Component({
	selector: "lifx-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
	groups$?: Observable<string[]>;
	bulbs$?: Observable<Record<string, Bulb[]>>;
	loading = true;

	constructor(
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
	}

	trackById: TrackByFunction<Bulb> = (_, bulb) => bulb.id;
}
