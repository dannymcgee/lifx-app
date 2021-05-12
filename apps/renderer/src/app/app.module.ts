import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { BulbComponent } from "./bulb/bulb.component";
import { ColorComponent } from "./color/color.component";
import { RelativePipe } from "./relative.pipe";
import { u16toFloatPipe } from "./u16-to-float.pipe";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
	],
	declarations: [
		AppComponent,
		BulbComponent,
		ColorComponent,
		RelativePipe,
		u16toFloatPipe,
	],
	bootstrap: [
		AppComponent
	],
})
export class AppModule {}
