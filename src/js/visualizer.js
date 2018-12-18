
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

    this.asteroids = [];

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
    this.camera.position.set(32,50,50);
    this.scene.add(this.camera);

    let that = this;

    // Update renderer size, aspect ratio and projection matrix on resize
    window.addEventListener('resize', function () {

    let WIDTH = window.innerWidth, HEIGHT = window.innerHeight;

    that.renderer.setSize(WIDTH, HEIGHT);

    that.camera.aspect = WIDTH / HEIGHT;
    that.camera.updateProjectionMatrix();

    });

    /*
    let light = new THREE.PointLight(0xffffff);
    light.position.set(-100, 200, 100);
    this.scene.add(light);
    */
    // Add lights
    let light = new THREE.AmbientLight(0x505050);
    this.scene.add(light);


    let directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight1.position.set(0, 1, 1);
    this.scene.add(directionalLight1);

    let directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight2.position.set(1, 1, 0);
    this.scene.add(directionalLight2);

    let directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight3.position.set(0, -1, -1);
    this.scene.add(directionalLight3);

    let directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight4.position.set(-1, -1, 0);
    this.scene.add(directionalLight4);


    // Add controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);



};

// Create some bars for music visualization
AudioVisualizer.prototype.createBars = function () {

    let cubeGeometry = new THREE.CubeGeometry(1.5, 1.5, 1.5);
    let cubeMaterial = new THREE.MeshPhongMaterial({
        color: getRandomColor(),
        flatShading: false,
        ambient: 0x808080,
        specular: 0xffffff,
        shininess: 14,
        reflectivity: 2,
    });

    // Iterate to create bars
    for (let i = 0, x = 0; x < 256; x += 2, i++) {

        //let barGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);

        // Create a material with shiny surface
        let barMaterial = new THREE.MeshPhongMaterial({
            color: getRandomColor(),
            ambient: 0x808080,
            specular: 0xffffff,
        });

        // Create each bar geometry and initialize the positions
        //this.bars[i] = new THREE.Mesh(cubeGeometry, barMaterial);
        //this.bars[i].position.set(i - this.barNumber/2, 0, 0);
        this.bars[i] = new Array();
        for (let j = 0, y = 0; y <= 62; y += 2, j++) {
            this.bars[i][j] = new THREE.Mesh(cubeGeometry, cubeMaterial);
            this.bars[i][j].position.set(y-30, 0, x);
            this.scene.add(this.bars[i][j])
        }

        // Add the newly-created bar to the scene
        //this.scene.add(this.bars[i]);
    }

    // Add background details

    let asteroidGeometry = new THREE.TetrahedronGeometry((Math.random() + 0.5 ), 2);
    let asteroidMaterial = new THREE.MeshPhongMaterial({
        color: getRandomColor(),
        flatShading: true
    });

    for(let i = 0; i < 1000; i++){
        this.asteroids[i] = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        this.asteroids[i].position.x = ( Math.random() - 0.5 ) * 300;
        this.asteroids[i].position.y = ( Math.random() - 0.5 ) * 300;
        this.asteroids[i].position.z = ( Math.random() - 0.5 ) * 300;
        this.asteroids[i].scale.z = (Math.random() * 2, Math.random() * 2, Math.random() * 2);
        this.asteroids[i].rotation.set(Math.random() * 4, Math.random() * 4, Math.random() * 4)
        this.scene.add(this.asteroids[i])
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
    this.jsNode.onaudioprocess = function animate() {

        let array = new Uint8Array(that.analyser.frequencyBinCount);
        that.analyser.getByteFrequencyData(array);

        visualizer.controls.update();

        /*
        let step = Math.round(array.length / visualizer.barNumber);
        // Iterate through the bars and scale the z axis
        for (let i = 0; i < visualizer.barNumber; i++) {
            let value = array[i * step] / 4;
            value = value < 1 ? 1 : value;
            visualizer.bars[i].scale.z = value;
        }
        */

        let k = 0;
        for(let i = 0; i < visualizer.bars.length; i++) {
            for(let j = 0; j < visualizer.bars[i].length; j++) {
                let scale = array[k] / 10;
                visualizer.bars[i][j].scale.y = (scale < 1 ? 1 : scale);
                k += (k < array.length ? 1 : 0);
            }
        }

        for(let i = 0; i < visualizer.asteroids.length; i++) {
            visualizer.asteroids[i].rotation.z += 0.02;

        }

        // Render the scene
        visualizer.renderer.render(visualizer.scene, visualizer.camera);

    }
};




