import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import "./src/styles/styles.css";
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import gsap from "gsap";
import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();



const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;



const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialiasL: true,
  alpha:true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.SRGNEncoding;


const composer=new EffectComposer(renderer)
const renderPass=new RenderPass(scene,camera);
composer.addPass(renderPass)

const RGBShiftpass=new ShaderPass(RGBShiftShader);
RGBShiftpass.uniforms['amount'].value=0.0030;
composer.addPass(RGBShiftpass)

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();


let model;

new RGBELoader()
  .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {

    const envmap = pmremGenerator.fromEquirectangular(texture).texture;
    // scene.background = envmap;
    scene.environment = envmap;
    texture.dispose();
    pmremGenerator.dispose();

    const loader = new GLTFLoader();
    loader.load('./DamagedHelmet.gltf', (gltf) => {
      model=gltf.scene
      scene.add(model);

    }, undefined, (error) => {
      console.error('An error occured while loading thr GTHFL model', error)
    });

  });







// const geometry= new THREE.BoxGeometry(1,1,1);
// const material= new THREE.MeshBasicMaterial({color:"red"});
// const mesh =new THREE.Mesh(geometry,material);
// scene.add(mesh);

// const cube =new THREE.Mesh(geometry,material);
//  scene.add(cube);






// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true,
//   renderer.render(scene, camera)


window.addEventListener("mousemove",(e)=>{
  if (model){
    const  rotationX= (e.clientX / window.innerHeight - .5)* (Math.PI * .12);
    const  rotationY= (e.clientY / window.innerWidth - .5)* (Math.PI * .12);
    // model.rotation.y=rotationX
    // model.rotation.x=rotationY
    gsap.to(model.rotation,{
      x: rotationY,
      y:rotationX,
      duration:0.9,
      ease:"power2.out"
    })
  }

});


window.addEventListener("resize",()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  composer.setSize(window.innerWidth,window.innerHeight);
  
  
});


function animate() {
  window.requestAnimationFrame(animate);
  composer.render();
  // controls.update();
  // mesh.rotation.x +=0.01;
  // mesh.rotation.y +=0.01;
  // mesh.rotation.z +=0.01;
  // renderer.render(scene, camera)
}

animate();
