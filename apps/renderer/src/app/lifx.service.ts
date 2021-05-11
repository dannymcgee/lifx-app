import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { Bulb } from "@lifx/api";
import { sleep } from "@lifx/std";

@Injectable({
	providedIn: "root",
})
export class LifxService implements OnDestroy {
	private _onDestroy$ = new Subject<void>();

	ngOnDestroy() {
		this._onDestroy$.next();
		this._onDestroy$.complete();
	}

	discover(): Observable<Bulb[]> {
		return new Observable(observer => {
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
		});
	}
}
