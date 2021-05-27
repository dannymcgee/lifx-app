/** Visualize value as a line graph */
float plot( float val ) {
	return smoothstep( val-0.02, val, v_uv.y )
	     - smoothstep( val, val+0.02, v_uv.y );
}

#pragma glslify: export(plot)
