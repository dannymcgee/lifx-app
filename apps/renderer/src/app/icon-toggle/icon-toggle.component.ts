import { FocusMonitor } from "@angular/cdk/a11y";
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
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
} from "@angular/core";
import { MatRipple, RippleRef } from "@angular/material/core";
import { MatTooltip } from "@angular/material/tooltip";

import { fromEvent, interval, merge } from "rxjs";
import { filter, first, takeUntil } from "rxjs/operators";

import { Coerce } from "../utility/coerce.decorator";

@Component({
	selector: "lifx-icon-toggle",
	templateUrl: "./icon-toggle.component.html",
	styleUrls: ["./icon-toggle.component.scss"],
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconToggleComponent implements OnInit, OnDestroy {
	@Input() id: string;

	@HostBinding("class")
	get hostClasses() {
		return [
			"lifx-icon-toggle",
			this.color,
		];
	}

	@HostBinding("class.checked")
	@HostBinding("attr.aria-checked")
	@Input() value: boolean;
	@Output() valueChange = new EventEmitter<boolean>();

	@HostBinding("class.disabled")
	@HostBinding("attr.aria-disabled")
	@Input() disabled = false;

	@Input() color: "primary"|"accent" = "primary";

	@HostBinding("style.width.px")
	@HostBinding("style.height.px")
	@Input() @Coerce(Number) size = 24;

	@HostBinding("style.border-radius.px")
	get radius() { return this.size / 2; }

	@Input() icon: string;
	@Input()
	get uncheckedIcon(): string { return this._unchckedIcon ?? this.icon; }
	set uncheckedIcon(value: string) { this._unchckedIcon = value; }
	private _unchckedIcon?: string;

	@HostBinding("attr.aria-label")
	@Input() label?: string;
	@Input() description?: string;

	@HostBinding("attr.aria-describedby")
	get ariaDescribedBy(): string|null {
		if (!this.description) return null;
		return `${this.id}_description`;
	}

	_tooltipMessage: string;

	@HostBinding()
	get tabIndex(): number {
		return this.disabled ? -1 : 0;
	}

	@ViewChild(MatTooltip)
	tooltip: MatTooltip;

	@ViewChild("activeRipple", { read: MatRipple })
	activeRipple: MatRipple;

	@ViewChild("focusRipple", { read: MatRipple })
	focusRipple: MatRipple;
	private _focusRippleRef?: RippleRef;

	get _activeIcon(): string {
		return this.value ? this.icon : this.uncheckedIcon;
	}

	private _isPressed = false;

	constructor(
		private _changeDetector: ChangeDetectorRef,
		private _elementRef: ElementRef,
		private _focusMonitor: FocusMonitor,
	) {}

	ngOnInit() {
		this._focusMonitor
			.monitor(this._elementRef)
			.subscribe(origin => {
				if (origin === "keyboard") {
					this._focusRippleRef = this.focusRipple.launch({
						centered: true,
						persistent: true,
						terminateOnPointerUp: false,
						radius: Math.SQRT2 * this.radius,
						animation: {
							enterDuration: 100,
							exitDuration: 200,
						},
					});
				}
				if (origin === null) {
					this._focusRippleRef?.fadeOut();
				}
			});
	}

	ngOnDestroy() {
		this._focusMonitor.stopMonitoring(this._elementRef);
	}

	@HostListener("click", ["$event"])
	toggle(event: Event) {
		event.stopPropagation();
	}

	@HostListener("keydown.enter", ["$event"])
	@HostListener("keydown.space", ["$event"])
	@HostListener("pointerdown", ["$event"])
	_launchRipple(event: Event) {
		event.preventDefault();
		event.stopPropagation();

		if (this._isPressed) return;
		this._isPressed = true;

		let ripple = this.activeRipple.launch({
			centered: true,
			persistent: true,
			radius: Math.SQRT2 * this.radius,
			animation: {
				enterDuration: 200,
				exitDuration: 400,
			},
		});

		let { nativeElement: element } = this._elementRef;
		merge(
			fromEvent(element, "pointerup"),
			fromEvent<KeyboardEvent>(element, "keyup").pipe(
				filter(evt => /(^Enter| $)/.test(evt.key))
			)
		)
			.pipe(first())
			.subscribe(() => {
				this._isPressed = false;
				ripple?.fadeOut();
				this.valueChange.emit(!this.value);
			});
	}

	@HostListener("pointerenter")
	_openTooltip() {
		if (!this.label) return;

		this._tooltipMessage = this.label;
		this._changeDetector.detectChanges();
		this.tooltip.show();

		let { nativeElement: element } = this._elementRef;
		let pointerleave$ = fromEvent(element, "pointerleave");

		interval(2500).pipe(
			first(),
			takeUntil(pointerleave$),
		).subscribe(() => {
			if (!this.description) return;
			this._tooltipMessage = this.description
			this._changeDetector.detectChanges();
		});

		pointerleave$
			.pipe(first())
			.subscribe(() => {
				this.tooltip.hide();
			});
	}
}
