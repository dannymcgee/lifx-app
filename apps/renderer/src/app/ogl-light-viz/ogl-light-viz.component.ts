import {
	Component,
	ElementRef,
	Input,
	OnInit,
	ViewChild,
} from '@angular/core';

import chroma from "chroma-js";
import * as createContext from "gl-context";
import * as loadShader from "gl-shader";

import { Loop } from "../utility/loop.decorator";
import vert from "./ogl-light-viz.vert.glsl";
import frag from "./ogl-light-viz.frag.glsl";

@Component({
	selector: 'lifx-ogl-light-viz',
	template: `
		<canvas class="canvas" #canvasRef></canvas>
	`,
	styles: [`
		:host {
			overflow: hidden;
		}
		:host,
		.canvas {
			display: block;
			width: 100%;
			height: 100%;

		}
	`],
})
export class OglLightVizComponent implements OnInit {
	@Input() brightness: number;
	@Input() kelvin: number;

	private get _baseColor() {
		return (chroma
			.temperature(this.kelvin)
			.rgb(false)
			.map(channel => channel / 255)
		) as [number, number, number];
	}

	@ViewChild("canvasRef", { static: true })
	private _canvasRef: ElementRef<HTMLCanvasElement>;
	private get _canvas() { return this._canvasRef.nativeElement; }

	private _shader: any;
	private _buffer: WebGLBuffer;

	constructor(
		private _elementRef: ElementRef<HTMLElement>,
	) {}

	ngOnInit(): void {
		let { clientWidth, clientHeight } = this._elementRef.nativeElement;
		let scale = window.devicePixelRatio;
		this._canvas.width = clientWidth * scale;
		this._canvas.height = clientHeight * scale;

		let gl = createContext(this._canvas, { antialias: true });
		this._shader = loadShader(gl, vert, frag);
		this._buffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,  1,  0,
			-1, -1,  0,
			 1,  1,  0,
			-1, -1,  0,
			 1,  1,  0,
			 1, -1,  0,
		]), gl.STATIC_DRAW);
	}

	@Loop render(): void {
		let gl = this._shader.gl;
		this._shader.bind();
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

		this._shader.attributes.position.pointer();
		this._shader.uniforms.baseColor = this._baseColor;
		this._shader.uniforms.brightness = this.brightness;

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
}
