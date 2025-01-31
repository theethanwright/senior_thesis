import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const GOOGLE_API_KEY = 'AIzaSyAHYmaViAhziAVy1ccdDWSc6Z_yGjbZ4Iw';
const SEARCH_ENGINE_ID = 'YOUR_SEARCH_ENGINE_ID';

class ImageHandler {
    constructor() {
        this.images = [];
        this.loader = document.getElementById('loader');
    }

    async searchImages(query) {
        this.loader.style.display = 'block';
        const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&searchType=image&q=${query}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            const items = data.items || [];
            this.images = this.selectRandomImages(items, 10);
            await this.displayImagesIn3D();
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            this.loader.style.display = 'none';
        }
    }

    selectRandomImages(items, count) {
        return items
            .sort(() => 0.5 - Math.random())
            .slice(0, count)
            .map(item => item.link);
    }

    async displayImagesIn3D() {
        for (let i = 0; i < this.images.length; i++) {
            const texture = await new THREE.TextureLoader().loadAsync(this.images[i]);
            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometry, material);
            
            // Position in circle
            const angle = (i / this.images.length) * Math.PI * 2;
            plane.position.set(
                Math.cos(angle) * 5,
                Math.sin(angle) * 5,
                0
            );
            scene.add(plane);
        }
    }
}

const imageHandler = new ImageHandler();

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

const axesHelper = new THREE.AxesHelper(100);
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

// Add event listener for button
document.getElementById('enterButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value;
    if (query) {
        imageHandler.searchImages(query);
    }
});