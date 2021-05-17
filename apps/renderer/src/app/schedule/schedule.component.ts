import { Component, Input } from '@angular/core';

@Component({
	selector: 'lifx-schedule',
	templateUrl: './schedule.component.html',
	styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent {
	@Input() group: string;
}
