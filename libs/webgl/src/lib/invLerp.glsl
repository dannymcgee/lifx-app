vec3 invLerp( vec3 a, vec3 b, vec3 val ) {
	return ( val - a ) / ( b - a );
}

/**
 * Returns the normalized position of `val` in the range of `a` to `b`
 *
 * @example
 * ```
 * float t = invLerp( 0.0, 200.0, 100.0 ); // => 0.5
 * ```
 */
float invLerp( float a, float b, float val ) {
	return ( val - a ) / ( b - a );
}

#pragma glslify: export(invLerp)
