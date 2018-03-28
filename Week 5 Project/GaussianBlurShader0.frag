precision mediump float;
varying vec4 fPosition;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform float Factor0;

const vec2 resolution = vec2(800.0, 600.0);
const vec2 uvKernel = 1.0 / resolution;

const float jump = 1.0;
const float pointRange = 10.0;
const float pointRangeSqr = pointRange * pointRange;

float normpdf(in float x, in float sigma)
{
	return 0.39894 * exp(-0.5 * (x * x) / (sigma * sigma)) / sigma;
}

float gaussianFunction2DX(float x)
{
	float sigma = 0.15; //x and y should be -1.0 <-> 1.0 with this variation
	
	float alpha = -((x * x) / (2.0 * (sigma * sigma)));
	
	return exp(alpha);
}

float gaussianFunction2DY(float y)
{
	float sigma = 0.15; //x and y should be -1.0 <-> 1.0 with this variation
	
	float alpha = -((y * y) / (2.0 * (sigma * sigma)));
	
	return exp(alpha);
}

float gaussianFunction2D(float x, float y)
{
	float sigma = 0.15; //x and y should be -1.0 <-> 1.0 with this variation
	
	float alpha = -((x * x + y * y) / (2.0 * (sigma * sigma)));
	
	return exp(alpha);
}

void main()
{
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	vec4 resultColor;
	vec2 point;
	
	int counter = 0;
	float totalWeight = 0.0;
	float animScale = pointRange * sin(Factor0) + pointRange;
		
	for(float u = -pointRange; u <= pointRange; u += jump)
	{
		point.y = fTexCoord.y + u/resolution.y;
		if(point.y > 0.0 || point.y < 1.0)
		{		
			for(float v = -pointRange; v <= pointRange; v += jump)
			{	
				if(point.x * point.x + point.y * point.y <= pointRangeSqr)
				{
					point.x = fTexCoord.x + v/resolution.x;
					if(point.x > 0.0 || point.x < 1.0)
					{
						float weight = gaussianFunction2D(u / pointRange, v / pointRange);
						
						resultColor += texture2D(_sampler2d, point.xy) * weight;
						
						totalWeight += weight;
					}
				}
			}
		}
	}
	//resultColor /= float(counter);
	
	gl_FragColor = resultColor / totalWeight;
}










