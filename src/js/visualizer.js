let visualizer;

$(document).ready(function () {
  visualizer = new AudioVisualizer();
  visualizer.initialize();
  visualizer.createBars();

});

function AudioVisualizer(){
  // For rendering
  this.scene;
  this.camera;
  this.renderer;
  this.controls;

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

