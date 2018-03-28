precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform float Factor0;

float uYPixelDistance;
float uXPixelDistance;

const vec2 resolution = vec2(800.0, 600.0);
const float jump = 1.0;
const float pointRange = 10.0;

void main()                                 
{
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	vec4 resultColor;
	vec2 point;
	
	int counter;
	
	float animScale = pointRange * sin(Factor0) + pointRange;
	
	float uXPixelDistance = 1.0/resolution.x;
	float uYPixelDistance = 1.0/resolution.y;
	
	for(float u = -pointRange; u <= pointRange; u += jump)
	{
		for(float v = -pointRange; v <= pointRange; v += jump)
		{
			point.x = fTexCoord.x + (u * uXPixelDistance);
			point.y = fTexCoord.y + (v * uYPixelDistance);
			
			if(point.y >= 0.0 && point.y <= 1.0 && point.x >= 0.0 && point.x <= 1.0)
			{
				++counter;
				
				resultColor += texture2D(_sampler2d, point.xy);
			}
		}
	}
	
	resultColor = resultColor / float(counter);
	
	gl_FragColor = resultColor;
}




