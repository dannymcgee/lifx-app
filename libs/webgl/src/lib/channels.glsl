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

#pragma glslify: export(channels)
