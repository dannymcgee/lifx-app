vec3 lerp( vec3 a, vec3 b, vec3 t ) {
	return a + t * ( b - a );
}

/**
 * Interpolates between `a` and `b`, using `t` as the normalized position in the
 * range.
 *
 * @example
 * ```
 * float val = lerp( 0.0, 200.0, 0.5 ); // => 100.0
 * ```
 */
float lerp( float a, float b, float t ) {
	return a + t * ( b - a );
}

#pragma glslify: export(lerp)
