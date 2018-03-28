#define GLFW_INCLUDE_ES2 1
#define GLFW_DLL 1
//#define GLFW_EXPOSE_NATIVE_WIN32 1
//#define GLFW_EXPOSE_NATIVE_EGL 1

#include <GLES2/gl2.h>
#include <EGL/egl.h>

#include <GLFW/glfw3.h>
//#include <GLFW/glfw3native.h>
#include <iostream>
#include <stdlib.h>
#include <stdio.h>
#include <string>
#include <fstream> 

#include "angle_util/Matrix.h"
#include "angle_util/geometry_utils.h"

#include "bitmap.h"
#include <fmod.hpp>
#include <fmod_errors.h>

#define WINDOW_WIDTH 800
#define WINDOW_HEIGHT 600

#define TEXTURE_COUNT 10

#define SPECTRUM_SIZE 128

GLint GprogramID = -1;
GLuint GtextureID[TEXTURE_COUNT];

GLFWwindow* window;

FMOD::System* m_fmodSystem;
FMOD::Sound* m_music;
FMOD::Channel* m_musicChannel;

float m_spectrumLeft[SPECTRUM_SIZE];
float m_spectrumRight[SPECTRUM_SIZE];

float spectrumAverage;

Matrix4 gPerspectiveMatrix;
Matrix4 gViewMatrix;

void ERRCHECK(FMOD_RESULT result)
{
	if (result != FMOD_OK)
	{
		printf("FMOD ERROR! (%d) %s\n", result, FMOD_ErrorString(result));
	}
}

static void error_callback(int error, const char* description)
{
	fputs(description, stderr);
}

GLuint LoadShader(GLenum type, const char *shaderSrc )
{
	GLuint shader;
	GLint compiled;
   
	// Create the shader object
	shader = glCreateShader ( type );

	if ( shader == 0 )
	return 0;

	// Load the shader source
	glShaderSource ( shader, 1, &shaderSrc, NULL );
   
	// Compile the shader
	glCompileShader ( shader );

	// Check the compile status
	glGetShaderiv ( shader, GL_COMPILE_STATUS, &compiled );

	if ( !compiled ) 
	{
		GLint infoLen = 0;

		glGetShaderiv ( shader, GL_INFO_LOG_LENGTH, &infoLen );
      
		if ( infoLen > 1 )
		{
			char infoLog[4096];
			glGetShaderInfoLog ( shader, infoLen, NULL, infoLog );
			printf ( "Error compiling shader:\n%s\n", infoLog );            
		}

		glDeleteShader ( shader );
		return 0;
	}

	return shader;
}

GLuint LoadShaderFromFile(GLenum shaderType, std::string path)
{
    GLuint shaderID = 0;
    std::string shaderString;
    std::ifstream sourceFile( path.c_str() );

    if( sourceFile )
    {
        shaderString.assign( ( std::istreambuf_iterator< char >( sourceFile ) ), std::istreambuf_iterator< char >() );
        const GLchar* shaderSource = shaderString.c_str();

		return LoadShader(shaderType, shaderSource);
    }
    else
        printf( "Unable to open file %s\n", path.c_str() );

    return shaderID;
}

void loadTexture(const char* path, GLuint textureID)
{
	CBitmap bitmap(path);

	glBindTexture(GL_TEXTURE_2D, textureID);

	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);

	// Bilinear filtering.
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);

	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, bitmap.GetWidth(), bitmap.GetHeight(), 0, GL_RGBA, GL_UNSIGNED_BYTE, bitmap.GetBits());
}

void InitFMOD()
{
	FMOD_RESULT result;
	unsigned int version;

	result = FMOD::System_Create(&m_fmodSystem);

	result = m_fmodSystem->getVersion(&version);
	ERRCHECK(result);

	if (version < FMOD_VERSION)
	{
		printf("FMOD Error! You are using an old version of FMOD.", version, FMOD_VERSION);
	}

	//initialize fmod system
	result = m_fmodSystem->init(32, FMOD_INIT_NORMAL, 0);
	ERRCHECK(result);

	//load and set up music
	result = m_fmodSystem->createStream("../media/HotlineMiami.mp3", FMOD_SOFTWARE, 0, &m_music);
	ERRCHECK(result);

	//play the loaded mp3 music
	result = m_fmodSystem->playSound(FMOD_CHANNEL_FREE, m_music, false, &m_musicChannel);
	ERRCHECK(result);
}

void UpdateFMOD()
{
	m_fmodSystem->update();

	//set spectrum for left and right stereo channel
	m_musicChannel->getSpectrum(m_spectrumLeft, SPECTRUM_SIZE, 0, FMOD_DSP_FFT_WINDOW_RECT);

	m_musicChannel->getSpectrum(m_spectrumRight, SPECTRUM_SIZE, 0, FMOD_DSP_FFT_WINDOW_RECT);

	spectrumAverage = (m_spectrumLeft[0] + m_spectrumRight[0]) / 2.0f;

	//point the first audio spectrum for both left and right channels
	std::cout << m_spectrumLeft[0] << ", " << m_spectrumRight[0] << std::endl;
}

int Init ( void )
{
	GLuint vertexShader;
	GLuint fragmentShader;
	GLuint programObject;
	GLint linked;

	// Load Textures
	glGenTextures(TEXTURE_COUNT, GtextureID);
	loadTexture("../media/graphics-card.bmp", GtextureID[0]);
	//load(Texture("../media/DarkRainbow.bmp", GtextureID[1]);

	// Initialize FMOD
	//InitFMOD();

	vertexShader = LoadShaderFromFile(GL_VERTEX_SHADER, "../vertexShader0.vert");
	fragmentShader = LoadShaderFromFile(GL_FRAGMENT_SHADER, "../GaussianBlurShader0.frag");

	// Create the program object
	programObject = glCreateProgram ( );
   
	if ( programObject == 0 )
		return 0;

	glAttachShader ( programObject, fragmentShader );
	glAttachShader ( programObject, vertexShader );

	// Bind vPosition to attribute 0   
	glBindAttribLocation ( programObject, 0, "vPosition" );
	glBindAttribLocation ( programObject, 1, "vColor" );
	glBindAttribLocation ( programObject, 2, "vTexCoord" );

	// Link the program
	glLinkProgram ( programObject );

	// Check the link status
	glGetProgramiv ( programObject, GL_LINK_STATUS, &linked );

	if ( !linked ) 
	{
		GLint infoLen = 0;

		glGetProgramiv ( programObject, GL_INFO_LOG_LENGTH, &infoLen );
      
		if ( infoLen > 1 )
		{
			//char* infoLog = malloc (sizeof(char) * infoLen );
			char infoLog[512];
			glGetProgramInfoLog ( programObject, infoLen, NULL, infoLog );
			printf ( "Error linking program:\n%s\n", infoLog );            
         
			//free ( infoLog );
		}

		glDeleteProgram ( programObject );
		return 0;
	}

	// Store the program object
	GprogramID = programObject;

	glClearColor(0.0f, 0.0f, 0.0f, 0.0f);

	glEnable(GL_DEPTH_TEST);
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);

	//Initialize matrices
	gPerspectiveMatrix = Matrix4::perspective(60.0f, (float)WINDOW_WIDTH / (float)WINDOW_HEIGHT, 0.5f, 30.0f);
	gViewMatrix = Matrix4::translate(Vector3(0.0f, 0.0f, -2.0f));

	return 1;
}

void UpdateCamera(void)
{
	static float yaw = 1.0f;
	static float pitch = 1.0f;
	static float distance = 1.5f;

	if (glfwGetKey(window, 'A'))
	{
		pitch -= 1.0f;
	}
	if (glfwGetKey(window, 'D'))
	{
		pitch += 1.0f;
	}
	if (glfwGetKey(window, 'W'))
	{
		yaw -= 1.0f;
	}
	if (glfwGetKey(window, 'S'))
	{
		yaw += 1.0f;
	}
	if (glfwGetKey(window, 'Z'))
	{
		distance -= 0.05f;
		if (distance < 1.0f)
		{
			distance = 1.0f;
		}
	}
	if (glfwGetKey(window, 'X'))
	{
		distance += 0.05f;
	}

	gViewMatrix = Matrix4::translate
	(
		Vector3(0.0f, 0.0f, -distance)) *
		Matrix4::rotate(yaw, Vector3(1.0f, 0.0f, 0.0f)) *
		Matrix4::rotate(pitch, Vector3(0.0f, 1.0f, 0.0f)
		);
}

void DrawSquare(void)
{
	float sizeX = 1.0f;
	float sizeY = 1.0f;

	GLfloat vVertices[] =
	{
		-sizeX,  sizeY, 0.0f,
		-sizeX, -sizeY, 0.0f,
		 sizeX, -sizeY, 0.0f,
		-sizeX,  sizeY, 0.0f,
		 sizeX,  sizeY, 0.0f,
		 sizeX, -sizeY, 0.0f,
	};

	GLfloat vColors[] =
	{
		1.0f, 0.0f, 0.0f, 1.0f,
		0.0f, 1.0f, 0.0f, 1.0f,
		0.0f, 0.0f, 1.0f, 1.0f,
		1.0f, 0.0f, 0.0f, 1.0f,
		0.0f, 1.0f, 0.0f, 1.0f,
		0.0f, 0.0f, 1.0f, 1.0f,
	};

	GLfloat vTexCoord[] =
	{
		0.0f, 1.0f,
		0.0f, 0.0f,
		1.0f, 0.0f,
		0.0f, 1.0f,
		1.0f, 1.0f,
		1.0f, 0.0f,
	};

	glBindTexture(GL_TEXTURE_2D, GtextureID[5]);

	// Use the program object
	glUseProgram(GprogramID);

	// Load the vertex data
	glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 0, vVertices);
	glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, 0, vColors);
	glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 0, vTexCoord);

	glEnableVertexAttribArray(0);
	glEnableVertexAttribArray(1);
	glEnableVertexAttribArray(2);

	glDrawArrays(GL_TRIANGLES, 0, 6);

	glDisableVertexAttribArray(0);
	glDisableVertexAttribArray(1);
	glDisableVertexAttribArray(2);
}

// Variables For Music
float factor0 = 0.0f;

const float PI = 3.142f;

void Draw(void)
{
	// Set the viewport
	glViewport(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

	// Clear the colour buffer
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	//UpdateFMOD();
	UpdateCamera();

	// Set the sampler2D varying variable to the first texture unit(index 0)
	glUniform1i(glGetUniformLocation(GprogramID, "sampler2D"), 0);

	factor0 += 0.1f;

	GLint factor0Loc = glGetUniformLocation(GprogramID, "Factor0");
	if (factor0Loc != -1)
	{
		glUniform1f(factor0Loc, factor0);
	}

	static float modelRotation = 0.0f;

	Matrix4 modelMatrix, mvpMatrix;

	modelMatrix = Matrix4::translate
	(
		Vector3(0.0f, 0.0f, 0.0f)) *
		Matrix4::rotate(-modelRotation, Vector3(0.0f, 1.0f, 0.0f)
		);

	mvpMatrix = gPerspectiveMatrix * gViewMatrix * modelMatrix;
	GLint mvpMatrixLoc = glGetUniformLocation(GprogramID, "uMvpMatrix");

	if (mvpMatrixLoc != -1)
	{
		glUniformMatrix4fv(mvpMatrixLoc, 1, GL_FALSE, mvpMatrix.data);
	}

	DrawSquare();
}

int main(void)
{
	glfwSetErrorCallback(error_callback);

	// Initialize GLFW library
	if (!glfwInit())
	return -1;

	glfwDefaultWindowHints();
	glfwWindowHint(GLFW_CLIENT_API, GLFW_OPENGL_ES_API);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 2);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 0);

	// Create and open a window
	window = 
		glfwCreateWindow(WINDOW_WIDTH,
		WINDOW_HEIGHT,
		"Shader Test",
		NULL,
		NULL);

	if (!window)
	{
		glfwTerminate();
		printf("glfwCreateWindow Error\n");
		exit(1); 
	}

	glfwMakeContextCurrent(window);
	
	Init();

	// Repeat Update Function
	while (!glfwWindowShouldClose(window)) 
	{
		Draw();
		glfwSwapBuffers(window);
		glfwPollEvents();

		if (glfwGetKey(window, GLFW_KEY_ESCAPE))
		{
			break;
		}
	}

	glfwDestroyWindow(window);
	glfwTerminate();
	exit(EXIT_SUCCESS);
}
