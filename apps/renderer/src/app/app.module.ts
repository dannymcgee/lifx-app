// Angular Imports
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// 3rd-Party UI Imports
import { MatRippleModule } from "@angular/material/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

// Child Modules
import { UtilityModule } from "./utility/utility.module";

// Module Declarations
import { AppComponent } from "./app.component";
import { BulbComponent } from "./bulb/bulb.component";
import { ColorComponent } from "./color/color.component";
import { IconToggleComponent } from "./icon-toggle/icon-toggle.component";
import { KnobComponent } from './knob/knob.component';
// import { CssLightVizComponent } from "./css-light-viz/css-light-viz.component";
import { LogoComponent } from "./logo/logo.component";
import { LightVizComponent } from './light-viz/light-viz.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { TitlebarComponent } from './titlebar/titlebar.component';

@NgModule({
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		FormsModule,
		HttpClientModule,
		MatButtonModule,
		MatIconModule,
		MatRippleModule,
		MatTooltipModule,
		UtilityModule,
	],
	declarations: [
		AppComponent,
		BulbComponent,
		ColorComponent,
		// TODO: Enable this as a fallback for low-spec systems?
		// CssLightVizComponent,
		IconToggleComponent,
		KnobComponent,
		LogoComponent,
		LightVizComponent,
		ScheduleComponent,
		TitlebarComponent,
	],
	bootstrap: [
		AppComponent
	],
})
export class AppModule {}
