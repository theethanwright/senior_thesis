import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { createNoise3D } from 'simplex-noise';

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

const noise2D = createNoise3D();

const meshes = [];
for (let i = 0; i < 100; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const mesh = new THREE.Mesh(geometry, material);
  const nx = noise2D(i, 0) * 10;
  const ny = noise2D(0, i) * 10;
  const nz = noise2D(i, i) * 10;
  mesh.position.set(nx, ny, nz);
  scene.add(mesh);
  meshes.push({ mesh, material });
}

camera.position.z = 5;

function animate() {
    const time = performance.now() * 0.0005;

    color = new THREE.Color().setHSL((Date.now() % 10000) / 10000, 1, 0.5).getHex();

    meshes.forEach(({ mesh, material }) => {
        const nx = noise2D(i, time) * 10;
        const ny = noise2D(time, i) * 10;
        const nz = noise2D(i, i) * 10;
        mesh.position.set(nx, ny, nz);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        material.color.setHex(color);
    });

    if (controls.isLocked) {
        if (moveForward) controls.moveForward(speed);
        if (moveBackward) controls.moveForward(-speed);
        if (moveLeft) controls.moveRight(-speed);
        if (moveRight) controls.moveRight(speed);
    }

	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );