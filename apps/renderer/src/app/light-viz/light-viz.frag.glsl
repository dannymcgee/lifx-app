precision highp float;

#pragma glslify: remap = require(@lifx/remap)
#pragma glslify: debugRange = require(@lifx/debugRange)
#pragma glslify: random = require(glsl-random/lowp)

varying vec2 v_uv;
varying float v_sideLength;
varying float v_bulbRadius;

uniform vec2 u_resolution;
uniform vec2 u_randomSeed;
uniform vec3 u_baseColor;
uniform vec3 u_background;
uniform float u_brightness;

/** Returns the average value of the components of a vector */
float avg( vec3 vec ) {
	return ( vec.x + vec.y + vec.z ) / 3.0;
}

float distFromCenter() {
	float distX = (( u_resolution.x / 2.0 ) - gl_FragCoord.x ) / v_sideLength;
	float distY = (( u_resolution.y / 2.0 ) - gl_FragCoord.y ) / v_sideLength;

	return length( vec2(distX, distY) );
}

vec3 bulbSphere() {
	float dist = distFromCenter();

	// The bulb itself
	if ( dist < v_bulbRadius)
		return u_baseColor;

	// Bloom-y glow effect around the bulb
	else if ( dist < v_bulbRadius + 0.05 ) {
		float glowFactor = remap( dist,
			v_bulbRadius, v_bulbRadius + 0.05,
			0.75, 0.0
		);
		return pow( glowFactor, 5.0 ) * u_baseColor;
	}

	// Outside the bloom radius
	else return vec3( 0.0 );
}

float ease( float val, float exp ) {
	float divisor = pow( val, exp );
	float dividend = divisor + pow( 1.0 - val, exp );

	return divisor / dividend;
}

void main() {
	// Distance from viewport center
	float dist = 1.0 - distFromCenter();

	// Base glow
	float halo = remap( dist,
		remap( u_brightness,
			0.0, 1.0,
			0.4, 0.25 ),
		1.0,
		0.0, remap( u_brightness,
			0.0, 1.0,
			0.5, 1.0 )
	);
	halo = clamp( halo, 0.0, 1.0 );

	// Helper variables
	vec3 minVal = vec3(0.0);
	vec3 maxVal = u_baseColor * u_brightness;

	// Dimmed linear radial gradient from center point
	vec3 colorLin = u_baseColor * halo * pow( u_brightness, 0.5 );
	vec3 color1 = remap( colorLin,
		minVal, maxVal,
		minVal, ( maxVal * 0.333 ));

	// Exponential radial gradient from center point
	float haloExp = pow( halo, remap( pow( u_brightness, 0.5 ),
		0.0, 1.0,
		1.0, 2.0 ) );
	vec3 colorExp = u_baseColor * haloExp * pow( u_brightness, 0.175 );

	// Tight glow right around the bulb
	float haloTight = remap( distFromCenter(),
		v_bulbRadius, v_bulbRadius + remap( u_brightness,
			0.0, 1.0,
			0.05, 0.5 ),
		0.75, 0.0 );
	haloTight = clamp( haloTight, 0.0, 1.0 );
	vec3 colorHalo = u_baseColor
		* pow( haloTight, remap( u_brightness,
			0.0, 1.0,
			6.0, 3.0 ) )
		* pow( u_brightness, 0.05 );

	// Add the layers together
	vec3 color = remap(
		( u_background + color1 + colorExp + colorHalo ),
		u_background, ( vec3(0.555) + avg( u_baseColor ) + u_background ),
		u_background, vec3(1.0) );

	// Clamp the darkest pixels to the background color
	color = vec3(
		max( color.r, u_background.r ),
		max( color.g, u_background.g ),
		max( color.b, u_background.b ) );

	vec3 bulb = bulbSphere();
	color += bulb * pow( u_brightness, 0.1 );
	color += ( random( gl_FragCoord.xy / u_randomSeed ) * 0.036 );

	gl_FragColor = vec4( color, 1.0 );
}
