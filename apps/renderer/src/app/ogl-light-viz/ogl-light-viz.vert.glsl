precision highp float;

varying vec2 v_uv;
attribute vec3 a_position;

void main() {
	gl_Position = vec4(a_position, 1.0);
	v_uv = a_position.xy;
}
