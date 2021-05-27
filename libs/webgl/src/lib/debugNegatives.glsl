/**
 * Returns the original vector, with any component whose value is less than zero
 * transformed to 1. Useful for debugging non-grayscale colors where one channel
 * is less than zero, to determine which channel is the problematic one.
 */
vec3 debugNegatives( vec3 value ) {
	bvec3 neg = lessThan( value, vec3(0.0) );

	return vec3(
		neg.r ? 1.0 : 0.0,
		neg.g ? 1.0 : 0.0,
		neg.b ? 1.0 : 0.0
	);
}

#pragma glslify: export(debugNegatives)
