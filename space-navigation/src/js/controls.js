// controls.js

// Handle user input for navigation
document.addEventListener('keydown', function(event) {
    const key = event.key;
    const speed = 0.1; // Movement speed

    switch (key) {
        case 'w': // Move forward
            camera.position.z -= speed;
            break;
        case 's': // Move backward
            camera.position.z += speed;
            break;
        case 'a': // Move left
            camera.position.x -= speed;
            break;
        case 'd': // Move right
            camera.position.x += speed;
            break;
    }
});