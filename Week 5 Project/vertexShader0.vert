attribute vec4 vPosition;
attribute vec4 vColor;
attribute vec2 vTexCoord;

varying vec4 fColor;
varying vec2 fTexCoord;

void main()                 
{             
	fColor = vColor;     
	
	fTexCoord = vTexCoord;
	
	gl_Position = vPosition; 
}
