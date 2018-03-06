precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform float Factor0;

void main()                                 
{
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	vec4 resultColor;
	
	float average = (texColor.r + texColor.g + texColor.b) / 3.0;
	
	//resultColor = vec4 (average, average, average, 1.0);
	
	resultColor.r = average;
	resultColor.g = average;
	resultColor.b = average;
	resultColor.a = 1.0;
	
	gl_FragColor = resultColor;
}