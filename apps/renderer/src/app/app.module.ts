// Angular Imports
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// 3rd-Party UI Imports
import { MatRippleModule } from "@angular/material/core";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";

// Module Declarations
import { AppComponent } from "./app.component";
import { BulbComponent } from "./bulb/bulb.component";
import { ColorComponent } from "./color/color.component";
import { CommaSeparatedPipe } from "./comma-separated.pipe";
import { GroupIconPipe } from "./group-icon.pipe";
import { IconToggleComponent } from "./icon-toggle/icon-toggle.component";
import { KnobComponent } from './knob/knob.component';
import { LightVizComponent } from "./light-viz/light-viz.component";
import { RelativePipe } from "./relative.pipe";
import { ScheduleComponent } from './schedule/schedule.component';
import { u16toFloatPipe } from "./u16-to-float.pipe";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		MatCheckboxModule,
		MatExpansionModule,
		MatIconModule,
		MatRippleModule,
		MatTabsModule,
		MatToolbarModule,
		MatTooltipModule,
	],
	declarations: [
		AppComponent,
		BulbComponent,
		ColorComponent,
		CommaSeparatedPipe,
		GroupIconPipe,
		IconToggleComponent,
		KnobComponent,
		LightVizComponent,
		RelativePipe,
		ScheduleComponent,
		u16toFloatPipe,
	],
	bootstrap: [
		AppComponent
	],
})
export class AppModule {}
