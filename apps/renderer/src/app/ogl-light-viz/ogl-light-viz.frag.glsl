precision highp float;

#pragma glslify: remap = require(@lifx/remap)

varying vec2 v_uv;

uniform vec3 u_baseColor;
uniform vec3 u_background;
uniform float u_brightness;

/** Returns the average value of the components of a vector */
float avg( vec3 vec ) {
	return ( vec.x + vec.y + vec.z ) / 3.0;
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
