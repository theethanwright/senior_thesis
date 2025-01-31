import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { createNoise2D } from 'simplex-noise';

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

let color = 0x00ff00;

camera.position.z = 5;

function animate() {

    if (controls.isLocked) {
        if (moveForward) controls.moveForward(speed);
        if (moveBackward) controls.moveForward(-speed);
        if (moveLeft) controls.moveRight(-speed);
        if (moveRight) controls.moveRight(speed);
    }

	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );