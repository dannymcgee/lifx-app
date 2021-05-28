import {
	AfterContentInit,
	Component,
	ContentChildren,
	ElementRef,
	forwardRef,
	Input,
	OnDestroy,
	QueryList,
} from '@angular/core';

import { Observable, Subject } from "rxjs";
import { map, startWith, takeUntil } from "rxjs/operators";

import { Coerce } from "../decorators";


@Component({
	selector: 'lifx-auto-grid, [lifx-auto-grid]',
	template: `<ng-content></ng-content>`,
	styles: [`
		:host {
			display: grid;
			width: 100%;
			height: 100%;
		}
	`],
})
export class AutoGridComponent implements AfterContentInit, OnDestroy {
	@ContentChildren(forwardRef(() => GridTileComponent))
	_gridTiles: QueryList<GridTileComponent>;

	private get _element(): HTMLElement {
		return this._elementRef.nativeElement;
	}

	private _onDestroy$ = new Subject<void>();

	constructor(
		private _elementRef: ElementRef<HTMLElement>
	) {}

	ngAfterContentInit() {
		this._gridTiles.changes.pipe(
			startWith(this._gridTiles),
			takeUntil(this._onDestroy$),
		).subscribe((tiles: QueryList<GridTileComponent>) => {
			let {
				aspect,
				minColWidth,
				minRowHeight,
			} = tiles.reduce((acc, cur) => ({
				aspect: acc.aspect + cur.aspectRatio,
				minColWidth: Math.max(acc.minColWidth, cur.minWidth),
				minRowHeight: Math.max(acc.minRowHeight, cur.minHeight),
			}), {
				aspect: 0,
				minColWidth: 1,
				minRowHeight: 1,
			});
			aspect /= tiles.length;

			let { clientWidth, clientHeight } = this._element;
			let gridAspect = clientWidth / clientHeight;

			// This roughly corresponds to the ideal distribution of rows:columns
			let bias = aspect / gridAspect;

			let maxCols = clientWidth / minColWidth;
			let maxRows = clientHeight / minRowHeight;
		});
	}

	ngOnDestroy() {
		this._onDestroy$.next();
		this._onDestroy$.complete();
	}
}


@Component({
	selector: "lifx-grid-tile, [lifx-grid-tile]",
	template: `<ng-content></ng-content>`,
	styles: [],
})
export class GridTileComponent {
	@Input() @Coerce(Number) minHeight = 0;
	@Input() @Coerce(Number) minWidth = 0;
	@Input("aspectRatio") _aspectRatio: string;

	get aspectRatio(): number {
		let [w, h] = this._aspectRatio.split(":").map(s => parseInt(s, 10));
		return w / h;
	}
}
