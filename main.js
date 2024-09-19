import * as THREE from "three";

import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

import { GLTFLoader } from "./node_modules/three/examples/jsm/loaders/GLTFLoader.js";

import * as dat from "dat.gui";

const TRex = new URL("/assets/Rampaging T-Rex.glb", import.meta.url);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

renderer.setClearColor(0x808080);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(-12, 9, 12);

orbit.update();

const textureLoader = new THREE.TextureLoader();

const cubeTextureLoader = new THREE.CubeTextureLoader();

// const ambient = new THREE.AmbientLight(0xffffff);

// scene.add(ambient);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const assetLoader = new GLTFLoader();
let mixer;
let model;
assetLoader.load(
  TRex.href,
  function (gltf) {
    model = gltf.scene;
    scene.add(model);
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    clips.forEach(function (clip) {
      const action = mixer.clipAction(clip);
      action.play();
    });

    // camera.lookAt(model.position);

    // orbit.enabled = false;
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

/// Code By GPT ///
let platformSize = 30; // Initial size of the platform
const platformGrowthThreshold = 5; // Distance from the edge of the platform to trigger growth
const platformGrowthAmount = 50; // How much to extend the platform by
let gridHelper;
// Create the initial platform (plane)
const planeGeo = new THREE.PlaneGeometry(platformSize, platformSize);
const planeMat = new THREE.MeshStandardMaterial({
  color: 0x000000, // Gray platform
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeo, planeMat);
scene.add(plane);

// Position the platform
plane.rotation.x = -0.5 * Math.PI; // Flat on the ground
plane.position.set(0, 0, 0); // Initial position

function extendPlatform() {
  const trexPos = model.position;

  // Check if the T-Rex is nearing the edge of the platform (within the threshold)
  if (
    Math.abs(trexPos.x) > platformSize / 2 - platformGrowthThreshold ||
    Math.abs(trexPos.z) > platformSize / 2 - platformGrowthThreshold
  ) {
    // Increase the platform size
    platformSize += platformGrowthAmount;
    // Create a new larger platform and remove the old one
    scene.remove(plane);
    const newPlaneGeo = new THREE.PlaneGeometry(platformSize, platformSize);
    plane.geometry = newPlaneGeo; // Update geometry
    scene.add(plane);

    // Remove the old grid and add a new, larger one
    scene.remove(gridHelper);
    gridHelper = new THREE.GridHelper(platformSize, platformSize / 2);
    scene.add(gridHelper);

    // orbit.enabled = true;
  }
}

// // Plane //

// const planeGeo = new THREE.PlaneGeometry(20, 20);
// const planeMat = new THREE.MeshStandardMaterial({
//   side: THREE.DoubleSide,
//   color: 0x000000,
// });
// const plane = new THREE.Mesh(planeGeo, planeMat);
// scene.add(plane);

// Grid Helper //

// const gridHelper = new THREE.GridHelper();
// scene.add(gridHelper);
// plane.rotation.x = -0.5 * Math.PI;

gridHelper = new THREE.GridHelper(platformSize, platformSize / 2);
scene.add(gridHelper);

const clock = new THREE.Clock();

const followOffset = new THREE.Vector3(-10, 5, 10);

const gui = new dat.GUI();
const options = {
  static: true,
  // speed: 0.002,
};
let dynamic;
gui.add(options, "static").onChange(function (e) {
  if (e) {
    dynamic = false;
    orbit.enabled = true;
  } else {
    dynamic = true;
    orbit.enabled = false;
  }
});

// let step = 0;
// gui.add(options, "speed", 0, 2);
function animate() {
  if (mixer) {
    mixer.update(clock.getDelta());
    // step = options.speed;
    if (dynamic) {
      model.position.z += 0.02; //step;
      const newCameraPosition = model.position.clone().add(followOffset);
      camera.position.lerp(newCameraPosition, 0.1); // Smooth camera movement

      // Make the camera look at the T-Rex model's position
      camera.lookAt(model.position);
    }
    // let x = model.position.x;
    // let y = model.position.y;
    // let z = model.position.z + 10;
    // camera.position.set(10, 10, z);
    // if (model.position.z < 10) {
    //   model.position.z += 0.02;
    // } else {
    //   while (model.rotation.y == 0.5) model.rotation.y += 0.01;
    //   model.position.z -= 0.02;
    // }
    extendPlatform();
  }
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
