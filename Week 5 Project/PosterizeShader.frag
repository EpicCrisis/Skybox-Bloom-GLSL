precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform float Factor0;

const vec2 resolution = vec2(800.0, 600.0);

void main()                                 
{
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	vec4 resultColor = texColor;
	
	//float average = (texColor.r + texColor.g + texColor.b) / 3.0;
	
	float power = 64.0;
	float division = 256.0 / power;
	float saturation = 2.0;
	
	resultColor = floor(resultColor * division) / division;
	
	float average = (texColor.r + texColor.g + texColor.b) / 3.0;
	
	resultColor = vec4 (average, average, average, texColor.w);
	
	vec4 color0 = vec4(0.000, 0.215, 0.301, texColor.w);
	vec4 color1 = vec4(0.843, 0.101, 0.129, texColor.w);
	vec4 color2 = vec4(0.443, 0.588, 0.623, texColor.w);
	vec4 color3 = vec4(0.643, 0.788, 0.823, texColor.w);
	vec4 color4 = vec4(0.988, 0.894, 0.658, texColor.w);
	
	if(average < 0.2)
	{
		resultColor = color0;
	}
	if(average > 0.2 && average < 0.4)
	{
		resultColor = color1;
	}
	if(average > 0.4 && average < 0.6)
	{
		resultColor = color2;
	}
	if(average > 0.6 && average < 0.65)
	{
		resultColor = color3;
	}
	if(average > 0.65)
	{
		resultColor = color4;
	}
	
	//resultColor *= texColor;
	//resultColor *= saturation;
	
	gl_FragColor = resultColor;
}











