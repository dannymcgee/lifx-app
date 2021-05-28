declare module "*.glsl" {
	const shader: string;
	export default shader;
}

declare type int = number;
declare type float = number;
declare type vec2 = [number, number];
declare type vec3 = [number, number, number];
declare type vec4 = [number, number, number, number];

declare type Attributes<T extends Record<string, any>> = {
	[K in keyof T]: T[K] & {
		location: int;
		pointer(
			type?: int,
			normalized?: boolean,
			stride?: int,
			offset?: int,
		): void;
	}
}

declare interface Shader<
	A extends Attributes,
	U extends Record<string, any>,
> {
	attributes: A;
	uniforms: U;
	gl: WebGLRenderingContext;
	bind(): void;
	update(
		vertSrc: string,
		fragSrc: string,
		uniforms?: U,
		attributes?: A,
	): void;
	dispose(): void;
}
