precision mediump float;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform sampler2D _sampler2d;
uniform int uBlurDirection;
uniform float uTextureW;
uniform float uTextureH;

float gaussianFunction(float x)
{
	float variance = 0.15; //x should be 0-1.0 with this variance
	float alpha = -(x * x / (2.0 * variance));
	return exp(alpha);
}

float gaussianFunction2D(float x, float y)
{
	float variance = 0.15; //x and y should be 0-1.0 with this variance

	float alpha = -( (x * x + y * y) / (2.0 * variance));
	return exp(alpha);
}

void main()
{
	vec4 blurredColor;
	vec4 totalColor;
	vec4 texColor = texture2D(_sampler2d, fTexCoord);
	vec4 resultColor = texColor;
	
	float power = 64.0;
	float division = 256.0 / power;
	float saturation = 2.0;
	
	float average = (texColor.r + texColor.g + texColor.b) / 3.0;
	
	resultColor = floor(resultColor * division) / division;
	
	resultColor = vec4 (average, average, average, texColor.w);
	
	float textureW = uTextureW;
	float textureH = uTextureH;

	//Variables for calculating Gaussian Blur.
	float radiusSize = 50.0;
	float totalWeight = 0.0;
	
	//Variables for bloom settings.
	float glowIntensity = 1.35;
	
	if(uBlurDirection == 0) //Blur horizontally
	{
		float v = fTexCoord.y;
		float x; 
		for(x =- radiusSize; x <= radiusSize; x += 1.0)
		{
			float u = fTexCoord.x + x/textureW;
			if(u >= 0.0 && u <= 1.0)
			{
				float weight = gaussianFunction(x/radiusSize);
				totalColor += texture2D(_sampler2d, vec2(u,v)) * weight;
				totalWeight += weight;
			}
		}
		gl_FragColor = texColor;
		if(average <= 0.2)
		{
			gl_FragColor += totalColor / totalWeight * glowIntensity;
		}
	}
	else if (uBlurDirection == 1) //Blur vertically
	{
		float u = fTexCoord.x;
		float y;
		for(y =- radiusSize; y <= radiusSize; y += 1.0)
		{
			float v = fTexCoord.y + y/textureH;
			if(v >= 0.0 && v <= 1.0)
			{
				float weight = gaussianFunction(y/radiusSize);
				totalColor += texture2D(_sampler2d, vec2(u,v)) * weight;
				totalWeight += weight;
			}
		}
		gl_FragColor = texColor;
		if(average <= 0.2)
		{
			gl_FragColor += (totalColor / totalWeight) * glowIntensity;
		}
	}
	else //no blur
	{
		gl_FragColor = texture2D(_sampler2d, fTexCoord);
	}
	
	//gl_FragColor = texColor;
	// if(average >= 0.9)
	// {
		// gl_FragColor = texColor + blurredColor;
	// }
}












