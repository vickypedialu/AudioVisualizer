let visualizer;

$(document).ready(function () {
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

  // Bars are 3D shapes for music visualizations
  this.bars = [];
  this.barNumber = 60;

}

AudioVisualizer.prototype.initialize = function(){
  // Create a ThreeJS scene
  this.scene = new THREE.Scene();

  // Obtain the window size and renderer
  let WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

  this.renderer = new THREE.WebGLRenderer({antialias:true});
  this.renderer.setSize(WIDTH, HEIGHT);

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

  // Set background color of scene
  this.renderer.setClearColor(0x333F47, 1);

  // Create a light and add it to the scene
  let light = new THREE.PointLight(0xffffff);
  light.position.set(-100, 200, 100);
  this.scene.add(light);

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

        // Obtain the music file
        let file = e.dataTransfer.files[0];
        let fileName = file.name;

        $("#guide").text("Playing " + fileName);

        let fileReader = new FileReader();

        fileReader.onload = function (e) {
            let fileResult = e.target.result;
            visualizer.start(fileResult);
        };

        fileReader.onerror = function (e) {
            debugger
        };

        fileReader.readAsArrayBuffer(file);
    }, false);
};

// Process music file
AudioVisualizer.prototype.processAudio = function () {

    this.audioContext = new AudioContext();
    this.javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);
    this.javascriptNode.connect(this.audioContext.destination);

    // Create the source buffer and analyser node
    this.sourceBuffer = this.audioContext.createBufferSource();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 512;

    // Connect source to analyser, analyser to speaker
    this.sourceBuffer.connect(this.analyser);
    this.analyser.connect(this.javascriptNode);
    this.sourceBuffer.connect(this.audioContext.destination);

    let that = this;

    // Animate the bars
    this.javascriptNode.onaudioprocess = function () {

        let array = new Uint8Array(that.analyser.frequencyBinCount);
        that.analyser.getByteFrequencyData(array);

        // Render the scene
        visualizer.renderer.render(visualizer.scene, visualizer.camera);

        let step = Math.round(array.length / visualizer.barNumber);
        // Iterate through the bars and scale the z axis
        for (let i = 0; i < visualizer.barNumber; i++) {
            let value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            visualizer.bars[i].scale.z = value;
        }
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


