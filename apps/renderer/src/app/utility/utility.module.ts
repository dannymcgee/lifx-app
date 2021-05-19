import { NgModule } from "@angular/core";

import { CommaSeparatedPipe } from "./comma-separated.pipe";
import { GroupIconPipe } from "./group-icon.pipe";
import { RelativePipe } from "./relative.pipe";
import { u16toFloatPipe } from "./u16-to-float.pipe";

@NgModule({
	imports: [],
	declarations: [
		CommaSeparatedPipe,
		GroupIconPipe,
		RelativePipe,
		u16toFloatPipe,
	],
	exports: [
		CommaSeparatedPipe,
		GroupIconPipe,
		RelativePipe,
		u16toFloatPipe,
	],
})
export class UtilityModule {}
