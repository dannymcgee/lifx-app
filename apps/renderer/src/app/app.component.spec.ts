import { createComponentFactory, Spectator } from "@ngneat/spectator/jest";

import { AppComponent } from "./app.component";
import { LifxService } from "./electron.service";

describe("AppComponent", () => {
	let spectator: Spectator<AppComponent>;
	const createComponent = createComponentFactory({
		component: AppComponent,
		mocks: [LifxService],
	});

	beforeEach(() => {
		spectator = createComponent();
	});

	it("should create the app", () => {
		expect(spectator.component).toExist();
	});
});
