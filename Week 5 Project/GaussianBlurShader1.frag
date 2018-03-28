precision mediump float;
precision mediump int;
 
uniform sampler2D _sampler2d;
 
varying vec4 fColor;
varying vec2 fTexCoord;
 
// The inverse of the texture dimensions along X and Y
vec2 resolution = vec2(800.0, 600.0);
vec2 texOffset = 1.0 / resolution;

int blurSize = 100;       
int horizontalPass = 0; 			// 0 or 1 to indicate vertical or horizontal pass
float sigma = 20.0;         		// The sigma value for the gaussian function: higher value means more blur
									// A good value for 9x9 is around 3 to 5
									// A good value for 7x7 is around 2.5 to 4
									// A good value for 5x5 is around 2 to 3.5
 
const float pi = 3.14159265;
 
void main() 
{  
	float numBlurPixelsPerSide = float(blurSize / 2); 

	//vec2 blurMultiplyVec = 0 < horizontalPass ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec2 blurMultiplyVecVertical = vec2(0.0, 1.0);
	vec2 blurMultiplyVecHorizontal = vec2(1.0, 0.0);

	// Incremental Gaussian Coefficent Calculation (See GPU Gems 3 pp. 877 - 889)
	vec3 incrementalGaussian;
	incrementalGaussian.x = 1.0 / (sqrt(2.0 * pi) * sigma);
	incrementalGaussian.y = exp(-0.5 / (sigma * sigma));
	incrementalGaussian.z = incrementalGaussian.y * incrementalGaussian.y;

	vec4 avgValue0 = vec4(0.0, 0.0, 0.0, 0.0);
	vec4 avgValue1 = vec4(0.0, 0.0, 0.0, 0.0);
	float coefficientSum0 = 0.0;
	float coefficientSum1 = 0.0;

	// Take the central sample first...
	avgValue0 += texture2D(_sampler2d, fTexCoord.xy) * incrementalGaussian.x;
	avgValue1 += texture2D(_sampler2d, fTexCoord.xy) * incrementalGaussian.x;
	coefficientSum0 += incrementalGaussian.x;
	coefficientSum1 += incrementalGaussian.x;
	incrementalGaussian.xy *= incrementalGaussian.yz;

	// Go through the remaining 8 vertical samples (4 on each side of the center)
	for (float i = 0.0; i <= numBlurPixelsPerSide; ++i) 
	{ 
		avgValue0 += texture2D(_sampler2d, fTexCoord.xy - i * texOffset * blurMultiplyVecVertical) * incrementalGaussian.x;         
		avgValue0 += texture2D(_sampler2d, fTexCoord.xy + i * texOffset * blurMultiplyVecVertical) * incrementalGaussian.x;
		
		coefficientSum0 += 2.0 * incrementalGaussian.x;
		//incrementalGaussian.xy *= incrementalGaussian.yz;
	}
	
	for (float j = 0.0; j <= numBlurPixelsPerSide; ++j) 
	{ 
		avgValue1 += texture2D(_sampler2d, fTexCoord.xy - j * texOffset * blurMultiplyVecHorizontal) * incrementalGaussian.x;         
		avgValue1 += texture2D(_sampler2d, fTexCoord.xy + j * texOffset * blurMultiplyVecHorizontal) * incrementalGaussian.x;
		
		coefficientSum1 += 2.0 * incrementalGaussian.x;
		incrementalGaussian.xy *= incrementalGaussian.yz;
	}

	//gl_FragColor = avgValue0 / coefficientSum0;
	//gl_FragColor = avgValue1 / coefficientSum1;
	gl_FragColor = (avgValue0 + avgValue1) / (coefficientSum0 + coefficientSum1);
}




