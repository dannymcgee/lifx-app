import { Injectable } from "@angular/core";

import { interval, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

import { Bulb } from "@lifx/api";

@Injectable({
	providedIn: "root",
})
export class LifxService {
	discover(): Observable<Bulb[]> {
		return interval(500).pipe(
			switchMap(() => electron.discovery())
		);
	}
}
