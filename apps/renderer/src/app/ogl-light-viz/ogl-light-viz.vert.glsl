precision highp float;

attribute vec3 a_position;

varying vec2 v_uv;
varying float v_shortSide;
varying float v_bulbRadius;

uniform vec2 u_resolution;

void main() {
	gl_Position = vec4(a_position, 1.0);

	v_uv = a_position.xy;
	v_shortSide = min( u_resolution.x, u_resolution.y );
	v_bulbRadius = ( v_shortSide / 50.0 ) / v_shortSide;
}
