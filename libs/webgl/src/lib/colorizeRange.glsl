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

#pragma glslify: export(colorizeRange)
