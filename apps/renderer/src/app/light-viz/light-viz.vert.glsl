precision highp float;

attribute vec3 a_position;

varying vec2 v_uv;
varying float v_sideLength;
varying float v_bulbRadius;

uniform vec2 u_resolution;

void main() {
	gl_Position = vec4(a_position, 1.0);

	v_uv = a_position.xy;
	v_sideLength = max( u_resolution.x, u_resolution.y );
	v_bulbRadius = ( v_sideLength / 72.0 ) / v_sideLength;
}
