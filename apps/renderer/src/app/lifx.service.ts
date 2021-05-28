import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { map, shareReplay, takeUntil } from "rxjs/operators";

import { Bulb, HSBK, PowerLevel } from "@lifx/api";
import { sleep } from "@lifx/std";

@Injectable({
	providedIn: "root",
})
export class LifxService implements OnDestroy {
	private _bulbs$?: Observable<Bulb[]>;
	get bulbs$(): Observable<Bulb[]> {
		return this._bulbs$ ??= this._initBulbs();
	}

	private _onDestroy$ = new Subject<void>();

	ngOnDestroy() {
		this._onDestroy$.next();
		this._onDestroy$.complete();
	}

	bulb(id: string): Observable<Bulb> {
		return this.bulbs$.pipe(
			map(bulbs => bulbs.find(b => b.id === id))
		);
	}

	async getColor(id: string): Promise<HSBK> {
		return electron.getColor(id);
	}

	async setColor(id: string, color: HSBK, seconds: number) {
		await electron.setColor({ [id]: color }, seconds);
	}

	async setColors(targets: Record<string, HSBK>, seconds: number) {
		await electron.setColor(targets, seconds);
	}

	async setPowerLevel(id: string, powerLevel: PowerLevel) {
		await electron.setPowerLevel(id, powerLevel);
	}

	private _initBulbs() {
		return new Observable<Bulb[]>(observer => {
			let stopped = false;

			(async function ping() {
				if (stopped) return;

				let bulbs = await electron.discovery();
				observer.next(bulbs);

				await sleep(250);
				ping();
			})();

			return () => {
				stopped = true;
			}
		}).pipe(
			shareReplay(1),
			takeUntil(this._onDestroy$),
		);
	}
}
