// https://www.youtube.com/watch?v=kB0ZVUrI4Aw&list=PLjcVFFANLS5zH_PeKC6I8p0Pt1hzph_rt

"use strict";

let vertexShaderString = "";

let fragmentShaderString = "";

async function initWebGL()
{
  // load shader string from file
  await fetch('shader.frag').then(response => response.text()).then(data => fragmentShaderString = data);
  await fetch('shader.vert').then(response => response.text()).then(data => vertexShaderString = data);
 
  let canvas = document.getElementById('maincanvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let gl = canvas.getContext('webgl');

  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderString);
  gl.shaderSource(fragmentShader, fragmentShaderString);

  function compileShader(shader)
  {
    gl.compileShader(shader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS))
      console.error('error compiling shader', gl.getShaderInfoLog(shader));
  }

  compileShader(vertexShader);
  compileShader(fragmentShader);

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    console.error('error linking program', gl.getProgramInfoLog(program));

  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS))
      console.error('error validating program', gl.getProgramInfoLog(program));

  // ---------------------------------------

  //
  // setup and send buffer
  //

  // Create a buffer
  var boxVertices = 
  [ // X, Y, Z           R, G, B
    // Top
    -1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
    -1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
    1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
    1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

    // Left
    -1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
    -1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
    -1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
    -1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

    // Right
    1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
    1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
    1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
    1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

    // Front
    1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
    1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
    -1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
    -1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

    // Back
    1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
    1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
    -1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
    -1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

    // Bottom
    -1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
    -1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
    1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
    1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
  ];

  var boxIndices =
  [
    // Top
    0, 1, 2,
    0, 2, 3,

    // Left
    5, 4, 6,
    6, 4, 7,

    // Right
    8, 9, 10,
    8, 10, 11,

    // Front
    13, 12, 14,
    15, 14, 12,

    // Back
    16, 17, 18,
    16, 18, 19,

    // Bottom
    21, 20, 22,
    22, 20, 23
  ];

  // send the buffer to the GPU
  let vertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject); 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); 

  let indexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

  // tell the GPU how the buffer's structured and where to point its attribute variables
  let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  gl.vertexAttribPointer(
    positionAttribLocation, // Attribute location
    3, // number of elements per attribute
    gl.FLOAT, // type of elements
    gl.FALSE, // is data normalised?
    6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    0 // offset from the begining of a single vertex
  );
  gl.enableVertexAttribArray(positionAttribLocation);

  let colourAttribLocation = gl.getAttribLocation(program, 'vertColour');
  gl.vertexAttribPointer(
    colourAttribLocation, // Attribute location
    3, // number of elements per attribute
    gl.FLOAT, // type of elements
    gl.FALSE, // is data normalised?
    6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // offset from the begining of a single vertex
  );
  gl.enableVertexAttribArray(colourAttribLocation);

  //-------------------------------------------

  //
  // communicate uniform variables to the GPU
  //

  // Uniforms are bound to a shader program, so we have to tell OpenGL state machine which program is active
  gl.useProgram(program);

  // get pointers
  let mWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
  let mViewUniformLocation = gl.getUniformLocation(program, 'mView');
  let mProjUniformLocation = gl.getUniformLocation(program, 'mProj');

  let worldMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let projMatrix = new Float32Array(16);

  glMatrix.mat4.identity(worldMatrix);
  glMatrix.mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0,], [0, 1, 0]);
  glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(mWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(mViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(mProjUniformLocation, gl.FALSE, projMatrix);

  let xRotationMatrix = new Float32Array(16);
  let yRotationMatrix = new Float32Array(16);

  let iTimeUniformLocation = gl.getUniformLocation(program, 'iTime');
  let iResolutionUniformLocation = gl.getUniformLocation(program, 'iResolution');

  // // use the appropriate function to send datatype data
  // // more info: https://stackoverflow.com/questions/31049910/setting-uniforms-in-webgl
  gl.uniform1f(iTimeUniformLocation, 0.0);
  gl.uniform3fv(iResolutionUniformLocation, [canvas.width, canvas.height, 1]);


  //
  // Main render loop
  //
  let fakeTime = 0;
  let angle = 0;
  let identityMatrix = new Float32Array(16);
  glMatrix.mat4.identity(identityMatrix);
  function draw()
  {
    gl.uniform1f(iTimeUniformLocation, fakeTime);

    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    // glMatrix.mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]);
    glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle / 2, [1, 0, 0]);
    glMatrix.mat4.multiply(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(mWorldUniformLocation, gl.FALSE, worldMatrix);

    // set background colour
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0); // draw type, number of vertices, type of data, offset
    fakeTime += 0.01;
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
  

};

