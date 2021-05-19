import { Component, ChangeDetectionStrategy, ViewEncapsulation, HostBinding } from '@angular/core';

@Component({
	selector: 'lifx-titlebar',
	templateUrl: './titlebar.component.html',
	styleUrls: ['./titlebar.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None,
})
export class TitlebarComponent {
	@HostBinding("class") hostClass = "lifx-titlebar";

	minimize() {
		electron.minimizeWindow()
	}
	toggleMaximized() {
		electron.toggleMaximized();
	}
	close() {
		electron.closeWindow();
	}
}
