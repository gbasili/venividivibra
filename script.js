
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, clock;
let mixers = [];

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const canvas = document.getElementById('scene');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 6);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  clock = new THREE.Clock();

  // Sfondo
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load('background/background.jpg', function (texture) {
    scene.background = texture;
  });

  // Texture magliette
  const textures = [
    textureLoader.load('textures/maglia1.jpg'),
    textureLoader.load('textures/maglia2.jpg')
  ];

  // Modello
  const loader = new GLTFLoader();
  loader.load('models/person.glb', function (gltf) {
    for (let i = 0; i < 10; i++) {
      const clone = gltf.scene.clone(true);
      clone.position.x = (i % 5) * 1.2 - 2.4;
      clone.position.z = Math.floor(i / 5) * -2;
      scene.add(clone);

      // Magliette alternate
      clone.traverse(function (child) {
        if (child.isMesh && child.name.toLowerCase().includes("shirt")) {
          const texture = textures[i % textures.length];
          child.material = new THREE.MeshStandardMaterial({ map: texture });
        }
      });

      const mixer = new THREE.AnimationMixer(clone);
      if (gltf.animations.length > 0) {
        mixer.clipAction(gltf.animations[0]).play();
        mixers.push(mixer);
      }
    }
  });

  // Audio
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('audio/placeholder.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    sound.play();
  });
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach(mixer => mixer.update(delta));
  renderer.render(scene, camera);
}
