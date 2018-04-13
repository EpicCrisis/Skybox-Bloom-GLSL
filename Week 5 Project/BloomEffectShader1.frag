precision mediump float;
varying vec4 fPosition;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D sampler2d;
uniform int uState;
uniform int uBlurDirection;
uniform vec2 resolution;
uniform float Time;

vec2 uvPerKernel = 1.0 / resolution;

//Linearly interpolate between two values
float lerp(float v0, float v1, float t)
{
	return ((1.0 - t) * v0) + (t * v1);
}

float invLerp(float v0, float v1, float v)
{
	return (v - v0) / (v1 - v0);
}

vec4 highPassFilter(vec4 texColor, float normalizedExposure)
{
	vec4 ret = texColor;
	
	float avgColor = (texColor.x + texColor.y + texColor.z) / 3.0;
	
	if(avgColor < normalizedExposure)
	{
		ret = vec4(0.0);
	}
	
	return ret;
}

float gaussianFunction(float x, float variance)
{
	float alpha = - (x * x / (2.0 * variance));
	
	return exp(alpha);
}

vec4 gaussianBlur(vec4 texColor, float radius, int blurDirection, float jumpPixel, float variance) 
{
	vec4 ret = vec4(0.0);
	
	float total = 0.0;

	for(float i = -radius; i <= radius; i+=jumpPixel)
	{
		float x = fTexCoord.x;
		float y = fTexCoord.y;
		
		if(blurDirection == 0)
		{
			x += uvPerKernel.x * i;
		}
		else if(blurDirection == 1)
		{
			y += uvPerKernel.y * i;
		}
		
		if(x < 0.0 || x > 1.0)
			continue;
		if(y < 0.0 || y > 1.0)
			continue;
		
		vec4 pixelColor = texture2D(sampler2d, vec2(x, y));
		float weight = gaussianFunction(i / radius, variance);
		
		pixelColor *= weight;
		ret += pixelColor;
		total += weight;
	}
	
	ret /= total;
	
	return ret;
}

vec4 gaussianBlur(vec4 texColor, float radius, int blurDirection, float jumpPixel) 
{
	return gaussianBlur(texColor, radius, blurDirection, jumpPixel, 0.15);// x & y should be -1.0 to 1.0 with this variance
}

vec4 gaussianBlur(vec4 texColor, float radius, int blurDirection) 
{
	return gaussianBlur(texColor, radius, blurDirection, 1.0);
}

void main()
{
	vec4 texColor = texture2D(sampler2d, fTexCoord);
	
	if(uState == 0) 
	{
		gl_FragColor = highPassFilter(texColor, 0.25);
	}
	else if(uState == 1)
	{
		gl_FragColor = gaussianBlur(texColor, 20.0, uBlurDirection);
	}
	else
	{
		gl_FragColor = texColor;
	}
}