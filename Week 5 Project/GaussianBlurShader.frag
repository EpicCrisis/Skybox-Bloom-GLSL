precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform float Factor0;

float gaussianFunction2DX(float x)
{
	float variance = 0.15; //x and y should be -1.0 <-> 1.0 with this variation
	
	float alpha = -((x * x) / (2.0 * variance));
	
	return exp(alpha);
}

float gaussianFunction2DY(float y)
{
	float variance = 0.15; //x and y should be -1.0 <-> 1.0 with this variation
	
	float alpha = -((y * y) / (2.0 * variance));
	
	return exp(alpha);
}

float uYPixelDistance;
float uXPixelDistance;

const vec2 resolution = vec2(800.0, 600.0);
const float resX = 800.0;
const float resY = 600.0;

float radiusSize = 10.0;
float radiusSqr = radiusSize * radiusSize;

void main()                                 
{
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	vec4 resultColor;
	vec2 point;
	
	int counter;
	
	float uYPixelDistance = 1.0/resX;
	float uXPixelDistance = 1.0/resY;
	
	for(float u = -radiusSize; u <= radiusSize; ++u)
	{
		for(float v = -radiusSize; v <= radiusSize; ++v)
		{
			point.x = fTexCoord.x + (u * gaussianFunction2DX(uXPixelDistance));
			point.y = fTexCoord.y + (v * gaussianFunction2DY(uYPixelDistance));
			
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




