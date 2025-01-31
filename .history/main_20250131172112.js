import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
  controls.lock();
});

let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const speed = 0.05;

document.addEventListener('keydown', (event) => {
  if (event.key === 'w') moveForward = true;
  if (event.key === 's') moveBackward = true;
  if (event.key === 'a') moveLeft = true;
  if (event.key === 'd') moveRight = true;
});
document.addEventListener('keyup', (event) => {
  if (event.key === 'w') moveForward = false;
  if (event.key === 's') moveBackward = false;
  if (event.key === 'a') moveLeft = false;
  if (event.key === 'd') moveRight = false;
});

camera.position.z = 5;

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

function animate() {

    if (controls.isLocked) {
        if (moveForward) controls.moveForward(speed);
        if (moveBackward) controls.moveForward(-speed);
        if (moveLeft) controls.moveRight(-speed);
        if (moveRight) controls.moveRight(speed);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

renderer.setAnimationLoop( animate );