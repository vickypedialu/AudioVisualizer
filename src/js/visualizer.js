
let visualizer, $upload, $title;



$(document).ready(function () {

  $upload = $("#upload_music");
  $title = $("#title");


  visualizer = new AudioVisualizer();
  visualizer.initialize();
  visualizer.createBars();
  visualizer.handleActions();
  visualizer.processAudio();


});

function AudioVisualizer(){
  // For rendering
  this.scene;
  this.camera;
  this.renderer;

  // For user interaction
  this.controls;

  // Bars are 3D shapes for music visualizations
  this.bars = [];
  this.barNumber = 60;

  // For audio processing
  this.jsNode;
  this.audioContext;
  this.sourceBuffer;
  this.analyser;

}

AudioVisualizer.prototype.initialize = function(){
  // Create a ThreeJS scene
  this.scene = new THREE.Scene();

  // Obtain the window size and renderer
  let WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

  this.renderer = new THREE.WebGLRenderer({antialias:true});
  this.renderer.setSize(WIDTH, HEIGHT);


  // Append the render to document body
  document.body.appendChild(this.renderer.domElement);

  // Create a camera and add it to the scene
  this.camera = new THREE.PerspectiveCamera(40,WIDTH/HEIGHT,0.1,20000);
  this.camera.position.set(0,45,0);
  this.scene.add(this.camera);

  let that = this;

  // Update renderer size, aspect ratio and projection matrix on resize
  window.addEventListener('resize', function () {

    let WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

    that.renderer.setSize(WIDTH, HEIGHT);

    that.camera.aspect = WIDTH / HEIGHT;
    that.camera.updateProjectionMatrix();

  });

  // Create a light and add it to the scene
  let light = new THREE.PointLight(0xffffff);
  light.position.set(-100, 200, 100);
  this.scene.add(light);

  // Add controls
  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);



};

// Create some bars for music visualization
AudioVisualizer.prototype.createBars = function () {

  // Iterate to create bars
  for (let i = 0; i < this.barNumber; i++) {

    let barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    // Create a material with shiny surface
    let material = new THREE.MeshPhongMaterial({
      color: getRandomColor(),
      ambient: 0x808080,
      specular: 0xffffff
    });

    // Create each bar geometry and initialize the positions
    this.bars[i] = new THREE.Mesh(barGeometry, material);
    this.bars[i].position.set(i - this.barNumber/2, 0, 0);

    // Add the newly-created bar to the scene
    this.scene.add(this.bars[i]);
  }
};

// Start audio processing
AudioVisualizer.prototype.start = function (buffer) {
    this.audioContext.decodeAudioData(buffer, decodeAudioDataSuccess, decodeAudioDataFailed);
    let that = this;

    function decodeAudioDataSuccess(decodedBuffer) {
        // Get the successfully decoded audio buffer
        that.sourceBuffer.buffer = decodedBuffer
        that.sourceBuffer.start(0);
    }

    function decodeAudioDataFailed() {
        debugger
    }
};


// Listen to drag and drop actions, allowing users to update their own music
AudioVisualizer.prototype.handleActions = function () {

    document.body.addEventListener("dragenter", function () {

    }, false);

    document.body.addEventListener("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, false);

    document.body.addEventListener("dragleave", function () {

    }, false);

    document.body.addEventListener("drop", function (e) {
        e.stopPropagation();

        e.preventDefault();

        obtainMusic(e.dataTransfer.files);

    }, false);

    $title.on("click", function(e) {
        $upload.click();
    });

    $upload.on("change", function(e) {
        let files = document.getElementById("upload_music").files;
        obtainMusic(files);
    })
};

// Obtain the music file uploaded by user
function obtainMusic(files) {
    let file = files[0];
    let fileName = file.name;

    // Change title to display file name
    $title.text("Playing " + fileName);


    let fileReader = new FileReader();

    fileReader.onload = function (e) {
        let fileResult = e.target.result;
        visualizer.start(fileResult);
    };

    fileReader.onerror = function (e) {
        debugger
    };

    fileReader.readAsArrayBuffer(file);

}

// Process music file
AudioVisualizer.prototype.processAudio = function () {

    this.audioContext = new AudioContext();
    this.jsNode = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.jsNode.connect(this.audioContext.destination);

    // Create the source buffer and analyser node
    this.sourceBuffer = this.audioContext.createBufferSource();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 512;

    // Connect source to analyser, analyser to speaker
    this.sourceBuffer.connect(this.analyser);
    this.analyser.connect(this.jsNode);
    this.sourceBuffer.connect(this.audioContext.destination);

    let that = this;

    // Animate the bars
    this.jsNode.onaudioprocess = function () {

        let array = new Uint8Array(that.analyser.frequencyBinCount);
        that.analyser.getByteFrequencyData(array);

        // Render the scene
        visualizer.renderer.render(visualizer.scene, visualizer.camera);

        visualizer.controls.update();

        let step = Math.round(array.length / visualizer.barNumber);
        // Iterate through the bars and scale the z axis
        for (let i = 0; i < visualizer.barNumber; i++) {
            let value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            visualizer.bars[i].scale.z = value;
        }
    }
};




