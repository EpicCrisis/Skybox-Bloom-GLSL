precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform int uState;
uniform int uBlurDirection;
uniform float uTextureW;
uniform float uTextureH;

float gaussianFunction(float x, float variance)
{
	float alpha = -(x * x / (2.0 * variance));
	return exp(alpha);
}

float gaussianFunction2D(float x, float y)
{
	float variance = 0.15; //x and y should be 0-1.0 with this variance

	float alpha = -( (x * x + y * y) / (2.0 * variance));
	return exp(alpha);
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
			x += i / uTextureW;
		}
		else if(blurDirection == 1)
		{
			y += i / uTextureH;
		}
		
		if(x < 0.0 || x > 1.0)
			continue;
		if(y < 0.0 || y > 1.0)
			continue;
		
		vec4 pixelColor = texture2D(_sampler2d, vec2(x, y));
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
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	
	if(uState == 0) 
	{
		gl_FragColor = highPassFilter(texColor, 0.9);
	}
	else if(uState == 1)
	{
		gl_FragColor = gaussianBlur(texColor, 100.0, uBlurDirection, 4.0);
	}
	else
	{
		gl_FragColor = texColor;
	}
}












