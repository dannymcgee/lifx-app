precision highp float;

varying vec2 v_uv;

uniform vec3 u_baseColor;
uniform vec3 u_background;
uniform float u_brightness;

/** Visualize value as a line graph */
float plot( float val ) {
	return smoothstep( val-0.02, val, v_uv.y )
	     - smoothstep( val, val+0.02, v_uv.y );
}

/** Returns the average value of the components of a vector */
float avg( vec3 vec ) {
	return ( vec.x + vec.y + vec.z ) / 3.0;
}

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

/**
 * Colorizes a float in shades of magenta (for negative values) or green (for
 * positive values), where the intensity of the output indicates the absolute
 * magnitude of the value.
 */
vec3 colorizeRange( float value ) {
	vec3 magenta = vec3(1.0, 0.0, 1.0);
	vec3 green = vec3(0.0, 1.0, 0.0);

	if (value < 0.0)
		return magenta * abs( value );
	if (value >= 0.0)
		return green * value;
}

/**
 * Filters the output into its discrete R, G, and B channels.
 */
vec3 channels( vec3 color ) {
	if (v_uv.x < -0.333)
		return vec3( color.r, 0.0, 0.0 );
	else if (v_uv.x >= -0.333 && v_uv.x <= 0.333)
		return vec3( 0.0, color.g, 0.0 );
	else if (v_uv.x > 0.333)
		return vec3( 0.0, 0.0, color.b );
}

void main() {
	// Distance from viewport center
	float dist = 1.0 - distance( v_uv, vec2(0.0) );
	// Remapped to remove negatives
	dist = remap( dist,
		-0.5, 1.0,
		0.0, 1.0 );

	// Helper variables
	vec3 minVal = vec3(0.0);
	vec3 maxVal = u_baseColor * u_brightness;

	// Linear radial gradient from center point
	vec3 colorLin = u_baseColor * dist * u_brightness;
	// Dimmed
	vec3 color1 = remap( colorLin,
		minVal, maxVal,
		minVal, ( maxVal * 0.15 ));

	// Exponential radial gradient from center point
	float distExp = pow( dist, 6.0 );
	vec3 colorExp = u_baseColor * distExp * u_brightness;

	// Add the dimmed linear + exponential gradients together
	vec3 color = remap(( u_background + color1 + colorExp ),
		u_background, ( vec3(1.15) + u_background ),
		u_background, vec3(1.0) );

	// Clamp the darkest pixels to the background color
	color = vec3(
		max( color.r, u_background.r ),
		max( color.g, u_background.g ),
		max( color.b, u_background.b ) );

	// color = debugRange( color );
	// float line = plot( avg(color) );
	// color = color + line*vec3(0.0,1.0,0.0);

	gl_FragColor = vec4( color, 1.0 );
}
