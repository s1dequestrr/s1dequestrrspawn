// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff, 1); // Set background to white
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Responsive resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create main cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xffb347 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Parameters for bouncing
const bounds = {
    x: 3.5,
    y: 2,
    z: 0 // No bouncing in z
};
let velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.08,
    (Math.random() - 0.5) * 0.08,
    0
);

// Create trailing cubes
const trailCount = 8;
const trailDelay = 8; // frames between each trail
const trails = [];
for (let i = 0; i < trailCount; i++) {
    const trailMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.5 * (1 - i / (trailCount + 1))
    });
    const trailingCube = new THREE.Mesh(geometry, trailMaterial);
    scene.add(trailingCube);
    trails.push(trailingCube);
}

camera.position.z = 5;

// Store previous positions and rotations for trailing effect
const trailHistory = [];

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Move main cube
    cube.position.add(velocity);

    // Bounce off bounds
    if (cube.position.x > bounds.x || cube.position.x < -bounds.x) {
        velocity.x *= -1;
        cube.position.x = THREE.MathUtils.clamp(cube.position.x, -bounds.x, bounds.x);
    }
    if (cube.position.y > bounds.y || cube.position.y < -bounds.y) {
        velocity.y *= -1;
        cube.position.y = THREE.MathUtils.clamp(cube.position.y, -bounds.y, bounds.y);
    }

    // Rotate main cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Store current position and rotation in history
    trailHistory.push({
        position: cube.position.clone(),
        rotation: cube.rotation.clone()
    });

    // Keep history array at the needed length
    const maxHistory = trailCount * trailDelay + 1;
    if (trailHistory.length > maxHistory) {
        trailHistory.shift();
    }

    // Set trailing cubes to delayed positions and rotations
    for (let i = 0; i < trails.length; i++) {
        const historyIndex = trailHistory.length - (i + 1) * trailDelay - 1;
        if (historyIndex >= 0) {
            trails[i].position.copy(trailHistory[historyIndex].position);
            trails[i].rotation.copy(trailHistory[historyIndex].rotation);
        } else {
            trails[i].position.copy(cube.position);
            trails[i].rotation.copy(cube.rotation);
        }
    }

    renderer.render(scene, camera);
}
animate();
