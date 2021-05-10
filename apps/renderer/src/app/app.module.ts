import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { RelativePipe } from "./relative.pipe";

@NgModule({
	imports: [BrowserModule],
	declarations: [AppComponent, RelativePipe],
	bootstrap: [AppComponent],
})
export class AppModule {}
