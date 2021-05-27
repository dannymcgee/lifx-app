/**
 * Renders magenta if any component of `value` is less than zero, green if any
 * component is greater than one, or passes through the unmodified value if all
 * components fall within the range of 0 to 1.
 */
vec3 debugRange( vec3 value ) {
	if ( any( lessThan( value, vec3(0.0) )))
		return vec3( 1.0, 0.0, 1.0 );
	if ( any( greaterThan( value, vec3(1.0) )))
		return vec3( 0.0, 1.0, 0.0 );

	return value;
}

#pragma glslify: export(debugRange)
