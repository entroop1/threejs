import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import gsap from 'gsap'
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Loaders
 */

 const loadingManager = new THREE.LoadingManager(
    
        // Loaded
        () =>
        {
            console.log('loaded')
            gsap.to(scene.position, { duration:3, delay: 0, y:0,  })
        },
    
        // Progress
        () =>
        {
            console.log('progress')
        }
    
 )

 const dracoLoader = new DRACOLoader(loadingManager)
 dracoLoader.setDecoderPath('/draco/')
 const gltfLoader = new GLTFLoader(loadingManager)
 gltfLoader.setDRACOLoader(dracoLoader)
 const TextureLoader = new THREE.TextureLoader(loadingManager)

// Textures
const textureLoader = new THREE.TextureLoader()
const clouds = textureLoader.load('/textures/clouds.png')
const alphaClouds = textureLoader.load('/textures/alphaClouds.png')



//Scroll trigger

gsap.registerPlugin(ScrollTrigger)


/**
 * 
 * Raycaster
 */
 const raycaster = new THREE.Raycaster()
 let currentIntersect = null
 const rayOrigin = new THREE.Vector3(- 3, 0, 0)
 const rayDirection = new THREE.Vector3(10, 0, 0)
 rayDirection.normalize()
 

 /**
 * Mouse
 */
  const mouse = new THREE.Vector2()

  window.addEventListener('mousemove', (event) =>
  {
      mouse.x = event.clientX / sizes.width * 2 - 1
      mouse.y = - (event.clientY / sizes.height) * 2 + 1
  })
  

  
/**
 * Base
 */

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Materials

const material = new THREE.MeshNormalMaterial()
const cloudMaterial =  new THREE.MeshBasicMaterial({ color: '#000', alphaMap: alphaClouds})

/**
 * Objects
 */
 const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(3
        , 16, 16),
    new THREE.MeshBasicMaterial({ color: '#000000' })
)
object1.position.y = 1
object1.position.z = -3
object1.scale.y = 0.5


const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ 
        color: '#ff0000',
        transparent:true,
        opacity: 0.1 })
)

object2.position.y = 1

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000', })
)
object3.position.x = 2
scene.add(object2)

/**
 * Models
 */

let mixer = null
let mainMixer = null
let animOpenAction = null
let animCloseAction = null
let animStandingAction = null
let model1 = '/models/idle.gltf'
let model2 = '/models/idle.gltf'




//Model 2

gltfLoader.load(
    model2,
    (gltf) =>
    {

        gltf.scene.castShadow = true
        gltf.scene.receiveShadow = true
            gltf.scene.scale.set(3,3,3)
            gltf.scene.position.y = 0
            gltf.scene.position.x = 1
            scene.add(gltf.scene)
            console.log(gltf.scene)

        
            // Apply custom material
            gltf.scene.traverse((o) => {
                if (o.isMesh) o.material = material
              })

              
        Animation
        mainMixer = new THREE.AnimationMixer( gltf.scene )
        animOpenAction = mainMixer.clipAction( gltf.animations[0] )
        animCloseAction = mainMixer.clipAction( gltf.animations[1] )
        animStandingAction = mainMixer.clipAction( gltf.animations[2] )

        animCloseAction.play()

    }
)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 15),
)
floor.position.z = -3
floor.receiveShadow = true
floor.material = cloudMaterial
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)




/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(- 5, 5, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight 
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth,
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 12)
scene.add(camera)

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 0.75, 0)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
canvas: canvas,
alpha:false
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))




/**
 * Window Listener
 */


function playModifierAnimation(from, fSpeed, to, tSpeed) {
    // to.setLoop(THREE.LoopOnce);
    // to.reset()
    to.play()
    from.crossFadeTo(to, fSpeed, true)
    setTimeout(function() {
      from.enabled = true;
      to.crossFadeTo(from, tSpeed, true)
      currentlyAnimating = false
    }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000))
  }


  
function changeAnimation(){

    console.log('test')
    animCloseAction.play()  

 }




const t1 = gsap.timeline({ paused: true,})



t1.to(scene.rotation, { duration:1, delay: .1, y:1, })
t1.call(changeAnimation)


ScrollTrigger.create({
    animation: t1,
    trigger: '.portfolio',
    markers:true,
    start: "50%75%",
    end: "50% 76%",
    scrub: 2,
    toggleActions: "play none none reverse",
    }
    ) 


    

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime  




    //ray
    if (object1 !== null) {

    
        raycaster.set(rayOrigin, rayDirection)
        raycaster.setFromCamera(mouse, camera)
    
        const objectsToTest = [...scene.children, object2, ]
        const intersects = raycaster.intersectObjects(objectsToTest, true)
        if (intersects.length) {
            if (!currentIntersect) {
                console.log('mouse enter')

                // head.scale.set(2,2,2)
            }
            currentIntersect = intersects[0]
        }
        else {
            if (currentIntersect) {
                console.log('mouse leave')
                
                // head.scale.set(1,1,1)

            }
    
            currentIntersect = null
        }
    }

    
    // Model animation


    if(mainMixer)
    {
        mainMixer.update(deltaTime)
    }


    // Update controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

   
}

tick()