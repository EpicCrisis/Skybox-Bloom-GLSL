precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform float Factor0;

void main()                                 
{
	vec2 spotPos = vec2(400.0, 300.0);
	float circleRadius = Factor0;
	vec2 currentPixelPos = vec2(gl_FragCoord.x, gl_FragCoord.y);
	
	if(length(currentPixelPos - spotPos) <= circleRadius)
	{
		gl_FragColor = texture2D(_sampler2d, fTexCoord);
	}
	else
	{
		vec4 texColor = texture2D(_sampler2d, fTexCoord);
		
		float average = (texColor.r + texColor.g + texColor.b) / 3.0;
		vec4 finalColor = vec4(average, average, average, 1.0);
		
		gl_FragColor = finalColor;
	}
}