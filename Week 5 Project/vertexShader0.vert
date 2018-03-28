//Get from CPU
attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec2 vTexCoord;

//Pass to fragment shader
varying vec4 fPosition;
varying vec4 fColor;
varying vec2 fTexCoord;

uniform mat4 uMvpMatrix;

void main()                 
{   
	fPosition = vPosition;
	fColor = vColor;     
	fTexCoord = vTexCoord;
	
	gl_Position = uMvpMatrix * vPosition; //Do not do vPosition * uMvpMatrix, it's a matrix.
}
