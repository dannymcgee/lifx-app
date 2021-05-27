#pragma glslify: lerp = require(@lifx/lerp)
#pragma glslify: invLerp = require(@lifx/invLerp)

vec3 remap(
	vec3 value,
	vec3 fromA, vec3 fromB,
	vec3 toA, vec3 toB
) {
	vec3 t = invLerp( fromA, fromB, value );
	return lerp( toA, toB, t );
}

/**
 * Re-maps `value` from its position within the range `fromA` to `fromB`, to the
 * equivalent position within the range `toA` to `toB`.
 *
 * @example
 * ```
 * float val = remap( 5.0,
 * 	0.0, 10.0,
 * 	0.0, 200.0 ); // => 100.0
 * ```
 */
float remap(
	float value,
	float fromA, float fromB,
	float toA, float toB
) {
	float t = invLerp( fromA, fromB, value );
	return lerp( toA, toB, t );
}

#pragma glslify: export(remap)
