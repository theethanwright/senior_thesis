# README.md

# Space Navigation Project

This project is a WebGL application that allows users to navigate a space environment using the WASD keys. It utilizes the Three.js library for rendering 3D graphics.

## Project Structure

```
space-navigation
├── src
│   ├── js
│   │   ├── main.js         # Entry point of the application
│   │   ├── controls.js     # Handles user input for navigation
│   │   ├── renderer.js     # Responsible for rendering the scene
│   │   └── shaders
│   │       ├── vertex.glsl # Vertex shader code
│   │       └── fragment.glsl # Fragment shader code
│   ├── index.html          # Main HTML file
│   └── styles
│       └── main.css        # CSS styles for the application
├── lib
│   └── three.js            # Three.js library for 3D graphics
├── package.json            # npm configuration file
└── README.md               # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd space-navigation
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Open `src/index.html` in a web browser to run the application.

## Usage

- Use the **W** key to move forward.
- Use the **A** key to move left.
- Use the **S** key to move backward.
- Use the **D** key to move right.

Enjoy exploring the space environment!