import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostBinding,
	Input,
	Output,
	ViewEncapsulation,
} from '@angular/core';

import { PowerLevel } from "@lifx/api";

@Component({
	selector: 'lifx-power-toggle',
	templateUrl: './power-toggle.component.html',
	styleUrls: ['./power-toggle.component.scss'],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PowerToggleComponent {
	@HostBinding("class") hostClass = "lifx-power-toggle";

	@Input() id: string;
	@Input() disabled = false;

	@Input() powerLevel: PowerLevel
	@Output() powerLevelChange = new EventEmitter<PowerLevel>();

	PowerLevel = PowerLevel;

	toggle(): void {
		let next = this.powerLevel === PowerLevel.Enabled
			? PowerLevel.StandBy
			: PowerLevel.Enabled;

		this.powerLevelChange.emit(next);
	}
}
