import { Injectable, OnDestroy } from "@angular/core";

import { interval, Observable, Subject } from "rxjs";
import { concatMapTo, switchMap, takeUntil, takeWhile, tap } from "rxjs/operators";

import { Bulb } from "@lifx/api";

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
		return interval(500).pipe(
			switchMap(() => electron.discovery())
		);
	}
}

function isIncomplete(data: any): boolean {
	if (data == null)
		return true;

	if (Array.isArray(data))
		return data.some(isIncomplete)

	if (typeof data === "object")
		return Object.values(data).some(isIncomplete)

	return false;
}
