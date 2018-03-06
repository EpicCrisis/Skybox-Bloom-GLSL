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
	
	float inRadius0 = 0.0 + Factor0;
	float ouRadius0 = 0.0 + Factor0;
	float powInRad0 = inRadius0 * inRadius0;
	float powOuRad0 = ouRadius0 * ouRadius0;
	
	float circleEqnX0 = pow((gl_FragCoord.x - 400.0), 2.0);
	float circleEqnY0 = pow((gl_FragCoord.y - 300.0), 2.0);
	
	float circleEqn0 = circleEqnX0 + circleEqnY0;
	
	if (circleEqn0 <= powOuRad0)
	{
		resultColor = texColor; //Set resultColor to ORIGINAL COLOR
	}
	else
	{
		resultColor.r = average;
		resultColor.g = average;
		resultColor.b = average;
		resultColor.a = 1.0;
	}
	
	gl_FragColor = resultColor;
}