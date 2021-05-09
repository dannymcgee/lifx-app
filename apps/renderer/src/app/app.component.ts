import { Component } from "@angular/core";
import { LifxService } from "./electron.service";

@Component({
	selector: "lifx-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
})
export class AppComponent {
	groups?: string[];
	bulbs = new Map<string, any[]>();
	loading = false;

	constructor(
		private _lifx: LifxService,
	) {}

	async discover() {
		this.loading = true;
		let bulbs = await this._lifx.discover();

		this.groups = bulbs
			.map(b => b.group)
			.reduce((accum, curr) => {
				if (!accum.includes(curr))
					accum.push(curr)
				return accum;
			}, []);

		this.groups.forEach(g => this.bulbs.set(g, []));

		bulbs.forEach(b => this.bulbs.get(b.group)?.push(b));

		this.loading = false;
	}
}
