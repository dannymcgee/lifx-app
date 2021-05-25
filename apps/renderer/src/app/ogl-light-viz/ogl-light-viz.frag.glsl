precision highp float;

varying vec2 uv;

uniform vec3 baseColor;
uniform float brightness;

void main() {
	float dist = clamp(
		distance( uv.xy, vec2(0.0) ),
		0.0, 1.0
	);

	gl_FragColor = vec4( baseColor * (1.0 - dist) * brightness, 1.0 );
}
