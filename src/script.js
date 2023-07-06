import * as THREE from 'three';
import * as dat from 'lil-gui';
import gsap from 'gsap';

THREE.ColorManagement.enabled = false;

// TODO:
/**
 *   Add more content to the HTML
 *   Animate other properties like the material
 *   Animate the HTML texts
 *   Improve the particles
 *   Add more tweaks to the Debug UI
 *   Test other colors
 */

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
	materialColor: '#ffecf7',
	objectsDistance: 4,
};

gui.addColor(parameters, 'materialColor').onChange(() => {
	material.color.set(parameters.materialColor);
	particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textrureLoader = new THREE.TextureLoader();
const gradientTexture = textrureLoader.load('textures/gradients/3.jpg');
gradientTexture.magFilter = THREE.NearestFilter;

// Material
const material = new THREE.MeshToonMaterial({
	color: parameters.materialColor,
	gradientMap: gradientTexture,
});

//Meshes
const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(
	new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
	material
);
const sectionMeshes = [mesh1, mesh2, mesh3];
mesh1.position.y = -parameters.objectsDistance * 0;
mesh2.position.y = -parameters.objectsDistance * 1;
mesh3.position.y = -parameters.objectsDistance * 2;

mesh1.position.x = 1.7;
mesh2.position.x = -1.7;
mesh3.position.x = 1.7;
scene.add(mesh1, mesh2, mesh3);

/**
 * Light
 */

const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Particles
 */

const particlesCount = 2000;
const positions = new Float32Array(particlesCount * 3);

// Positions
for (let i = 0; i < particlesCount; i++) {
	const i3 = i * 3;
	positions[i3] = (Math.random() - 0.5) * 10;
	positions[i3 + 1] =
		parameters.objectsDistance * 0.5 -
		Math.random() * parameters.objectsDistance * sectionMeshes.length;
	positions[i3 + 2] = (Math.random() - 0.5) * 10;
}

// Geometry
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
	'position',
	new THREE.BufferAttribute(positions, 3)
);

//Material
const particlesMaterial = new THREE.PointsMaterial({
	size: 0.03,
	sizeAttenuation: true,
	color: parameters.materialColor,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes
 */

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(
	35,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	alpha: true,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

const clock = new THREE.Clock();
let previousTime = 0;

/**
 * Scroll
 */

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
	scrollY = window.scrollY;
	const newSection = Math.round(scrollY / sizes.height);

	if (newSection != currentSection) {
		currentSection = newSection;
		gsap.to(sectionMeshes[currentSection].rotation, {
			duration: 1.5,
			ease: 'power2.inOut',
			x: '+=4',
			y: '+=2',
			z: '+=0.5',
		});
	}
});

/**
 * Cursor
 */

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	//Animate meshes
	for (const mesh of sectionMeshes) {
		mesh.rotation.x += deltaTime * 0.1;
		mesh.rotation.y += deltaTime * 0.12;
	}

	//Animate camera
	camera.position.y = (-scrollY / sizes.height) * parameters.objectsDistance;

	const parallaxX = cursor.x * 0.5;
	const parallaxY = -cursor.y * 0.5;
	cameraGroup.position.x +=
		(parallaxX - cameraGroup.position.x) * 2 * deltaTime;
	cameraGroup.position.y +=
		(parallaxY - cameraGroup.position.y) * 2 * deltaTime;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
