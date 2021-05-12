import { createComponentFactory, Spectator } from "@ngneat/spectator/jest";

import { AppComponent } from "./app.component";
import { AppModule } from "./app.module";

describe("AppComponent", () => {
	let spectator: Spectator<AppComponent>;
	const createComponent = createComponentFactory({
		component: AppComponent,
		imports: [AppModule],
		declareComponent: false,
	});

	beforeEach(() => {
		spectator = createComponent();
	});

	it("should create the app", () => {
		expect(spectator.component).toExist();
	});
});
