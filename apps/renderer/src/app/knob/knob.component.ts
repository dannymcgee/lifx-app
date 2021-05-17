import { FocusMonitor } from "@angular/cdk/a11y";
import {
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
	ViewEncapsulation,
} from '@angular/core';
import { MatRipple, RippleRef } from "@angular/material/core";

import { animationFrameScheduler, fromEvent, merge, Subject } from "rxjs";
import {
	filter,
	map,
	pairwise,
	startWith,
	takeUntil,
	throttleTime,
} from "rxjs/operators";

import { clamp } from "../clamp";
import { Coerce } from "../coerce.decorator";
import { remap } from "../lerp";
import { Stepper } from "../stepper";
import { Vec2 } from "../vector";

enum Delta {
	Inc = 1,
	Dec = -1,
	None = 0,
}

@Component({
	selector: 'lifx-knob',
	templateUrl: './knob.component.html',
	styleUrls: ['./knob.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class KnobComponent implements OnInit, OnDestroy {
	@HostBinding("class") hostClass = "lifx-knob";
	@HostBinding() @Input() id: string;

	@Input() @Coerce(Number) min: number;
	@Input() @Coerce(Number) max: number;

	@Input() @Coerce(Number) kbStep = 1;
	@Input() @Coerce(Number) kbCoarse = 10;
	@Input() @Coerce(Number) kbFine = 0.1;

	@Input() @Coerce(Number) ptrStep = 1;
	@Input() @Coerce(Number) ptrCoarse = 10;
	@Input() @Coerce(Number) ptrFine = 0.1;
	private _ptrMagnitude: Stepper<number>;

	@Input() value: number;
	@Output() valueChange = new EventEmitter<number>();

	@HostBinding("class.disabled")
	@HostBinding("ariaDisabled")
	@Input() @Coerce(Boolean) disabled = false;

	@HostBinding("attr.aria-labelledby")
	get ariaLabelledBy(): string {
		return `${this.id}_label`;
	}

	@HostBinding()
	get tabIndex(): number {
		return this.disabled ? -1 : 0;
	}

	get _rotation(): number {
		return remap(
			this.value,
			[this.min, this.max],
			[-150, 150],
		);
	}

	@HostBinding("style.--rotation")
	get rotation(): string {
		return `rotate(${this._rotation}deg)`;
	}

	@HostBinding("style.--inverse-rotation")
	get inverseRotation(): string {
		return `rotate(${-this._rotation}deg)`;
	}

	@ViewChild(MatRipple)
	ripple: MatRipple;
	private _rippleRef?: RippleRef;

	private _onDestroy$ = new Subject<void>();

	constructor(
		private _elementRef: ElementRef,
		private _focusMonitor: FocusMonitor,
	) {}

	ngOnInit() {
		this._focusMonitor
			.monitor(this._elementRef)
			.subscribe(origin => {
				if (origin === "keyboard") {
					this._rippleRef = this.ripple.launch({
						animation: {
							enterDuration: 200,
							exitDuration: 400,
						},
						persistent: true,
						terminateOnPointerUp: false,
						centered: true,
						radius: 28,
					});
				}
				if (origin === null) {
					this._rippleRef?.fadeOut();
				}
			});

		this._ptrMagnitude = new Stepper([
			this.ptrFine,
			this.ptrStep,
			this.ptrCoarse,
		], 1);

		let keydown$ = fromEvent<KeyboardEvent>(window, "keydown");
		let keyup$ = fromEvent<KeyboardEvent>(window, "keyup");

		merge(
			keydown$.pipe(filter(evt => evt.key === "Shift")),
			keyup$.pipe(filter(evt => evt.key === "Control")),
		).pipe(
			takeUntil(this._onDestroy$),
		).subscribe(() => {
			this._ptrMagnitude.inc();
		});

		merge(
			keydown$.pipe(filter(evt => evt.key === "Control")),
			keyup$.pipe(filter(evt => evt.key === "Shift")),
		).pipe(
			takeUntil(this._onDestroy$),
		).subscribe(() => {
			this._ptrMagnitude.dec();
		});
	}

	ngOnDestroy() {
		this._focusMonitor.stopMonitoring(this._elementRef);
		this._onDestroy$.next();
		this._onDestroy$.complete();
	}

	@HostListener("mousedown", ["$event"])
	_startMouseAdjustment(event: MouseEvent) {
		event.preventDefault();

		fromEvent<MouseEvent>(document.body, "mousemove").pipe(
			startWith(event),
			throttleTime(0, animationFrameScheduler),
			map(Vec2.fromMouseEvent),
			pairwise(),
			takeUntil(merge(
				fromEvent(document.body, "mouseup"),
				fromEvent(document.body, "mouseleave"),
				this._onDestroy$
			))
		).subscribe(([prev, curr]) => {
			let delta = curr.minus(prev).asScreenPct();
			let change = Math.round(
				delta.y
				* -1
				* (this.max - this.min)
				* this._ptrMagnitude.get()
			);
			let value = this.value + change;
			value = clamp(value, [this.min, this.max]);

			if (value !== this.value) {
				this.valueChange.emit(value);
			}
		});
	}

	@HostListener("keydown", ["$event"])
	_adjust(event: KeyboardEvent) {
		if (!/^Arrow/.test(event.key)) return;
		event.preventDefault();

		let [delta, magnitude] = this._parseKeyboardEvent(event);
		let change = magnitude * delta;
		let value = this.value + change;
		value = clamp(value, [this.min, this.max]);

		if (value !== this.value) {
			this.valueChange.emit(value);
		}
	}

	private _parseKeyboardEvent(event: KeyboardEvent): [Delta, number] {
		let delta: Delta;
		let magnitude: number

		if (/^Arrow(Up|Right)$/.test(event.key)) {
			delta = Delta.Inc;
		} else if (/^Arrow(Down|Left)$/.test(event.key)) {
			delta = Delta.Dec;
		} else {
			delta = Delta.None;
		}

		if (event.getModifierState("Shift")) {
			magnitude = this.kbCoarse;
		} else if (event.getModifierState("Control")) {
			magnitude = this.kbFine;
		} else {
			magnitude = this.kbStep;
		}

		return [delta, magnitude];
	}
}
