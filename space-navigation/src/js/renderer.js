// renderer.js

let scene, camera, renderer;

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create the WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
}

function render() {
    requestAnimationFrame(render);
    // Update and render the scene
    renderer.render(scene, camera);
}

// Initialize and start rendering
init();
render();